import { PrismaClient } from '@prisma/client'

const resolveDatabaseUrl = () => process.env.DATABASE_URL ?? process.env.MONGO_URI ?? null

const resolveEngineType = () => {
  const rawValue = process.env.PRISMA_CLIENT_ENGINE_TYPE?.toLowerCase()

  if (!rawValue) {
    return 'library'
  }

  if (rawValue === 'dataproxy' || rawValue === 'prisma') {
    console.warn(
      'Detected PRISMA_CLIENT_ENGINE_TYPE set to a Data Proxy mode, which requires prisma:// URLs. Falling back to the native engine for MongoDB.',
    )
    return 'library'
  }

  if (rawValue === 'library' || rawValue === 'binary') {
    return rawValue
  }

  console.warn(
    `Unsupported PRISMA_CLIENT_ENGINE_TYPE "${rawValue}" detected. Falling back to the native library engine for Prisma.`,
  )
  return 'library'
}

declare global {
  var prisma: PrismaClient | undefined
}

let prismaInstance: PrismaClient | undefined

const createPrismaClient = () => {
  const databaseUrl = resolveDatabaseUrl()

  if (!databaseUrl) {
    throw new Error('DATABASE_URL (or MONGO_URI) must be configured for Prisma to connect to MongoDB')
  }

  const resolvedEngineType = resolveEngineType()

  process.env.PRISMA_CLIENT_ENGINE_TYPE = resolvedEngineType
  process.env.PRISMA_GENERATE_DATAPROXY = 'false'

  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = databaseUrl
  }

  return new PrismaClient({
    datasourceUrl: databaseUrl,
  })
}

const getPrismaInstance = (): PrismaClient => {
  if (prismaInstance) {
    return prismaInstance
  }

  if (global.prisma) {
    prismaInstance = global.prisma
    return prismaInstance
  }

  prismaInstance = createPrismaClient()

  if (process.env.NODE_ENV !== 'production') {
    global.prisma = prismaInstance
  }

  return prismaInstance
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaInstance()
    const value = client[prop as keyof PrismaClient]

    if (typeof value === 'function') {
      return value.bind(client)
    }

    return value
  },
})

export const getPrismaClient = getPrismaInstance
