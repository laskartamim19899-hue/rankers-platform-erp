import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

let _prisma: PrismaClient | null = null

function getPrisma(): PrismaClient {
  if (!_prisma) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('[Prisma] DATABASE_URL environment variable is not set!')
    }
    
    console.log('[PRISMA INIT] Using @prisma/adapter-pg with native Node.js pg pool')
    
    // Use native pg Pool (Node.js TCP) instead of Prisma's Rust engine
    // This bypasses the Rust binary TCP connectivity issues
    const pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    })
    const adapter = new PrismaPg(pool)
    _prisma = new PrismaClient({ adapter } as any)
  }
  return _prisma
}

// Lazy proxy so all existing code using `prisma.user.findUnique()` etc. works unchanged
const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as any)[prop]
  },
})

export default prisma
