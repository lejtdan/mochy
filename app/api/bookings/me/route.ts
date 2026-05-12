import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(req: Request) {
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

    // Buscamos las reservas donde este ID es pasajero
    const myBookings = await prisma.booking.findMany({
      where: { passengerId: decoded.id },
      include: {
        ride: {
          include: {
            driver: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ bookings: myBookings }, { status: 200 })
  } catch (error) {
    console.error('Error fetching my bookings:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
