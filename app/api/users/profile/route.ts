import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado - Token ausente' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token) as { id: string, role: string } | null
    
    if (!decoded) {
      return NextResponse.json({ error: 'No autorizado - Token inválido o expirado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado - Token ausente' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token) as { id: string, role: string } | null
    
    if (!decoded) {
      return NextResponse.json({ error: 'No autorizado - Token inválido o expirado' }, { status: 401 })
    }

    const body = await req.json()
    const { expoPushToken } = body

    if (expoPushToken !== undefined) {
      await prisma.user.update({
        where: { id: decoded.id },
        data: { expoPushToken }
      })
    }

    return NextResponse.json({ message: 'Perfil actualizado con éxito' }, { status: 200 })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Error interno del servidor al actualizar perfil' }, { status: 500 })
  }
}
