import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import Stripe from 'stripe'

// Inicializar Stripe con llave secreta Mock.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2026-03-25.dahlia' as any, // Bypass TS strictly to avoid version mismatch
});

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token) as { id: string } | null
    if (!decoded) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

    const { rideId, seatsToReserve } = await req.json()
    if (!rideId || !seatsToReserve) {
      return NextResponse.json({ error: 'Faltan parámetros de reserva' }, { status: 400 })
    }

    // Buscar viaje
    const ride = await prisma.ride.findUnique({
      where: { id: rideId }
    })

    if (!ride || ride.status !== 'ACTIVO') {
      return NextResponse.json({ error: 'Viaje no disponible' }, { status: 404 })
    }

    if (ride.availableSeats < seatsToReserve) {
      return NextResponse.json({ error: `Asientos insuficientes. Quedan ${ride.availableSeats}` }, { status: 400 })
    }

    // Calcular el precio total
    const totalAmount = ride.price * seatsToReserve;
    // Stripe requiere que el monto esté en centavos (ej: $10.00 -> 1000)
    const amountInCents = Math.round(totalAmount * 100);

    // Crear un PaymentIntent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'mxn', // MXN por defecto, o USD según la app
      payment_method_types: ['card'],
      metadata: {
        rideId: ride.id,
        passengerId: decoded.id,
        seats: seatsToReserve
      }
    });

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
    }, { status: 200 })

  } catch (error: any) {
    console.error('Stripe Intent Error:', error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}
