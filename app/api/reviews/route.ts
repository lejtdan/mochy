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
    const decoded = verifyToken(token) as { id: string } | null
    if (!decoded) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

    const reviewerId = decoded.id;
    const { rideId, revieweeId, rating, comment } = await req.json()

    if (!rideId || !revieweeId || !rating) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos para calificar' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'La calificación debe ser de 1 a 5' }, { status: 400 })
    }

    // Opcional: Validar que el Viaje está COMPLETADO
    const rideInfo = await prisma.ride.findUnique({ where: { id: rideId } })
    if (!rideInfo || rideInfo.status !== 'COMPLETADO') {
      return NextResponse.json({ error: 'Solo se pueden dejar reseñas de viajes que hayan concluido.' }, { status: 403 })
    }

    // Opcional: Prevenir duplicados (ej: 1 reseña por usuario en un viaje específico)
    const existingReview = await prisma.review.findFirst({
      where: {
        rideId,
        reviewerId,
        revieweeId
      }
    })

    if (existingReview) {
      return NextResponse.json({ error: 'Ya has valorado a este usuario por este viaje.' }, { status: 409 })
    }

    const review = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment: comment || null,
        reviewerId,
        revieweeId,
        rideId
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: '¡Gracias por compartir tu experiencia!',
      review 
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error saving review:', error)
    return NextResponse.json({ error: 'Error interno guardando la reseña' }, { status: 500 })
  }
}
