import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
  try {
    const connectionString = process.env.DATABASE_URL
    
    // Durante el build de Next.js, a veces no hay acceso a las variables de entorno.
    // Retornamos un cliente básico para permitir que el build termine.
    if (!connectionString || process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL) {
       console.warn('DATABASE_URL not found or in build phase. Using basic client.')
       return new PrismaClient()
    }

    const pool = new Pool({ 
      connectionString,
      max: 10,
      ssl: { rejectUnauthorized: false }
    })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
  } catch (e) {
    console.error('Error initializing Prisma:', e)
    return new PrismaClient()
  }
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
