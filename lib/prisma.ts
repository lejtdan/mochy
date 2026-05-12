import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL

  // En Prisma 7, si el esquema no tiene URL, el constructor NECESITA una.
  // Durante el build de Vercel, si DATABASE_URL no está, usamos una URL dummy 
  // para que Next.js no falle al importar el módulo.
  if (!connectionString) {
    console.warn('DATABASE_URL not found. Using placeholder for build phase.')
    return new PrismaClient({
      datasourceUrl: "postgresql://postgres:password@localhost:5432/unused",
    })
  }

  try {
    const pool = new Pool({
      connectionString,
      max: 10,
      ssl: { rejectUnauthorized: false }
    })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter, datasourceUrl: connectionString })
  } catch (e) {
    console.error('Error initializing Prisma with adapter:', e)
    // Fallback al cliente estándar si falla el adaptador
    return new PrismaClient({ datasourceUrl: connectionString })
  }
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
