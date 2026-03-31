import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token) as { id: string } | null
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: { idVerified: true },
      select: {
        id: true,
        idVerified: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Identidad simulada verificada correctamente.', 
      user 
    }, { status: 200 })

  } catch (error) {
    console.error('Error verifying user:', error)
    return NextResponse.json({ error: 'Error al verificar cuenta.' }, { status: 500 })
  }
}
