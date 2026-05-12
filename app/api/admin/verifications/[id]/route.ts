import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: userId } = await params
    const { status } = await req.json()

    if (!status || !['VERIFIED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Estado inválido. Debe ser VERIFIED o REJECTED' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { verificationStatus: status },
      select: {
        id: true,
        verificationStatus: true
      }
    });

    return NextResponse.json({ message: `Usuario actualizado a ${status}`, user: updatedUser }, { status: 200 })

  } catch (error) {
    console.error('Error updating verification status:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
