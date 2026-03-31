import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const unverifiedUser = await prisma.user.findUnique({ where: { email } })
    if (!unverifiedUser) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    if (!unverifiedUser.password) {
      return NextResponse.json({ 
        error: 'Este usuario usa login social. Por favor entra con GitHub.' 
      }, { status: 401 })
    }

    const isValid = await comparePassword(password, unverifiedUser.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    const token = generateToken({ id: unverifiedUser.id, role: unverifiedUser.role })

    const { password: _, ...userWithoutPassword } = unverifiedUser

    return NextResponse.json({
      message: 'Inicio de sesión exitoso',
      user: userWithoutPassword,
      token,
    })
  } catch (error: any) {
    console.error('Error in login:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: error.code || 'UNKNOWN_ERROR'
    }, { status: 500 })
  }
}
