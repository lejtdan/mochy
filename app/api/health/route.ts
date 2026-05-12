import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Intenta una operación simple en la DB
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Health check failed:', error)
    return NextResponse.json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
