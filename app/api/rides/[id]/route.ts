import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rideId } = await params;

    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token) as { id: string, role: string } | null
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }
    
    // Verificar que el viaje exista y le pertenezca al conductor actual
    const ride = await prisma.ride.findUnique({
      where: { id: rideId }
    })

    if (!ride) {
      return NextResponse.json({ error: 'Viaje no encontrado' }, { status: 404 })
    }

    if (ride.driverId !== decoded.id) {
      return NextResponse.json({ error: 'No tienes permisos para cancelar este viaje' }, { status: 403 })
    }

    // Cancelar lógicamente en lugar de borrar el registro por completo
    const canceledRide = await prisma.ride.update({
      where: { id: rideId },
      data: { status: 'CANCELADO' }
    })

    return NextResponse.json({ message: 'Viaje cancelado con éxito', ride: canceledRide }, { status: 200 })
  } catch (error) {
    console.error('Error canceling ride:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
