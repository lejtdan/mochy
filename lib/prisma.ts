import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL

  // En Prisma 7, si el esquema no tiene URL, el constructor NECESITA un adapter o un accelerateUrl.
  // Durante el build de Vercel, si DATABASE_URL no está, usamos un Pool con una URL dummy 
  // para poder inicializar el adapter y que Next.js no falle en el type check ni al importar.
  if (!connectionString) {
    console.warn('DATABASE_URL not found. Using placeholder for build phase.')
    const dummyPool = new Pool({ connectionString: "postgresql://postgres:password@localhost:5432/unused" })
    const dummyAdapter = new PrismaPg(dummyPool)
    return new PrismaClient({ adapter: dummyAdapter })
  }

  try {
    const pool = new Pool({
      connectionString,
      max: 10,
      ssl: { rejectUnauthorized: false }
    })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
  } catch (e) {
    console.error('Error initializing Prisma with adapter:', e)
    // Fallback en caso de error usando el string original
    const fallbackPool = new Pool({ connectionString })
    const fallbackAdapter = new PrismaPg(fallbackPool)
    return new PrismaClient({ adapter: fallbackAdapter })
  }
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
