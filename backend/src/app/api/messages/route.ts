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

    const { text, receiverId, rideId } = await req.json()
    if (!text || !receiverId || !rideId) {
      return NextResponse.json({ error: 'Faltan datos del mensaje' }, { status: 400 })
    }

    // Guardar el mensaje en la Base de Datos
    const newMessage = await prisma.message.create({
      data: {
        text,
        senderId: decoded.id,
        receiverId,
        rideId
      }
    })

    // Buscar si el destinatario tiene Token Push habilitado
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { expoPushToken: true, name: true, email: true }
    })

    const sender = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { name: true, email: true }
    })

    if (receiver?.expoPushToken) {
      // Enviar Notificación Push Nativa mediante la API REST de Expo
      const pushPayload = {
        to: receiver.expoPushToken,
        sound: 'default',
        title: `Nuevo mensaje de ${sender?.name || sender?.email}`,
        body: text,
        data: { rideId: rideId, senderId: decoded.id }
      };

      try {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pushPayload),
        });
      } catch (pushErr) {
        console.error("No se pudo enviar la Push Notification:", pushErr);
      }
    }

    return NextResponse.json({ message: 'Mensaje enviado', data: newMessage }, { status: 201 })
  } catch (error: any) {
    console.error('Error enviando mensaje:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token) as { id: string } | null
    if (!decoded) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const rideId = searchParams.get('rideId')

    if (!rideId) return NextResponse.json({ error: 'rideId es requerido' }, { status: 400 })

    const messages = await prisma.message.findMany({
      where: { rideId },
      orderBy: { createdAt: 'asc' } // De antiguo a más reciente
    })

    return NextResponse.json({ messages }, { status: 200 })
  } catch (error) {
    console.error('Error obteniendo mensajes:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
