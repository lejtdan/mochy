import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token) as { id: string, role: string } | null
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    if (decoded.role !== 'CONDUCTOR') {
      return NextResponse.json({ error: 'Sólo los conductores pueden publicar viajes' }, { status: 403 })
    }

    const { origin, destination, originLat, originLng, destLat, destLng, date, availableSeats, price } = await req.json()

    if (!origin || !destination || !date || availableSeats === undefined || price === undefined) {
      return NextResponse.json({ error: 'Datos básicos incompletos' }, { status: 400 })
    }

    const newRide = await prisma.ride.create({
      data: {
        origin,
        destination,
        originLat: originLat ? Number(originLat) : null,
        originLng: originLng ? Number(originLng) : null,
        destLat: destLat ? Number(destLat) : null,
        destLng: destLng ? Number(destLng) : null,
        date,
        availableSeats: Number(availableSeats),
        price: Number(price),
        driverId: decoded.id
      }
    })

    return NextResponse.json({ message: 'Viaje publicado con éxito', ride: newRide }, { status: 201 })
  } catch (error) {
    console.error('Error creating ride:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')

    const filters: any = {
      status: 'ACTIVO',
      availableSeats: { gt: 0 }
    }

    if (origin) {
      filters.origin = { contains: origin } // SQLite es case-sensitive con contains, ideal para MVP.
    }
    
    if (destination) {
      filters.destination = { contains: destination }
    }

    const rides = await prisma.ride.findMany({
      where: filters,
      include: {
        driver: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    return NextResponse.json({ rides }, { status: 200 })
  } catch (error) {
    console.error('Error fetching rides:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
