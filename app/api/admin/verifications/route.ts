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
    if (!decoded || decoded.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Acceso denegado: Se requiere rol de SUPERADMIN' }, { status: 403 })
    }

    const pendingUsers = await prisma.user.findMany({
      where: {
        verificationStatus: 'PENDING_REVIEW'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        verificationStatus: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({ users: pendingUsers }, { status: 200 })

  } catch (error) {
    console.error('Error fetching pending verifications:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
