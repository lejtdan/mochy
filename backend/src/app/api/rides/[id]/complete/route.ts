import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rideId } = await params
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token) as { id: string } | null
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Buscar si el viaje le pertenece al conductor
    const ride = await prisma.ride.findUnique({
      where: { id: rideId }
    })

    if (!ride) {
      return NextResponse.json({ error: 'Viaje no encontrado' }, { status: 404 })
    }

    if (ride.driverId !== decoded.id) {
      return NextResponse.json({ error: 'No autorizado para completar este viaje' }, { status: 403 })
    }

    // Update ride to COMPLETADO
    const completedRide = await prisma.ride.update({
      where: { id: ride.id },
      data: { status: 'COMPLETADO' }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Viaje completado exitosamente', 
      ride: completedRide 
    }, { status: 200 })

  } catch (error) {
    console.error('Error completing ride:', error)
    return NextResponse.json({ error: 'Error del servidor al completar el viaje.' }, { status: 500 })
  }
}
