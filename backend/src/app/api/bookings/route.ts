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

    if (decoded.role !== 'PASAJERO') {
      return NextResponse.json({ error: 'Sólo los pasajeros pueden realizar reservas' }, { status: 403 })
    }

    const { rideId, seatsToReserve, paymentRef, amountPaid } = await req.json()

    if (!rideId || !seatsToReserve || !paymentRef) {
      return NextResponse.json({ error: 'Reserva o pago rechazado' }, { status: 400 })
    }

    // Usaremos una Transacción para asegurar la consistencia (No reservar más asientos de los que hay)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verificar viaje
      const ride = await tx.ride.findUnique({
        where: { id: rideId }
      })

      if (!ride || ride.status !== 'ACTIVO') {
        throw new Error('Viaje inactivo o no encontrado');
      }

      if (ride.availableSeats < seatsToReserve) {
        throw new Error(`Asientos insuficientes. Quedan ${ride.availableSeats}`);
      }

      // 2. Crear reserva
      const booking = await tx.booking.create({
        data: {
          seatsReserved: Number(seatsToReserve),
          passengerId: decoded.id,
          rideId: rideId,
          status: 'CONFIRMADA',
          paymentRef: paymentRef,
          amountPaid: isNaN(Number(amountPaid)) ? 0 : Number(amountPaid)
        }
      })

      // 3. Descontar asientos
      await tx.ride.update({
        where: { id: rideId },
        data: {
          availableSeats: ride.availableSeats - Number(seatsToReserve)
        }
      })

      return booking;
    });

    return NextResponse.json({ message: 'Reserva completada con éxito', booking: result }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 400 })
  }
}
