import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params
    
    // Obtener información pública del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        verificationStatus: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Obtener las reseñas recibidas
    const reviewsReceived = await prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: {
          select: { name: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calcular Rating
    let averageRating = 0;
    if (reviewsReceived.length > 0) {
      const sum = reviewsReceived.reduce((acc, rev) => acc + rev.rating, 0);
      averageRating = sum / reviewsReceived.length;
    }

    return NextResponse.json({
      ...user,
      averageRating: averageRating.toFixed(1),
      totalReviews: reviewsReceived.length,
      reviews: reviewsReceived
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
