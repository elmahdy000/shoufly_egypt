import 'dotenv/config';
import { PrismaClient } from "@/app/generated/prisma";


import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Optimized connection pool for high performance
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Maximum connections in pool
  min: 5,                     // Minimum connections to maintain
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Timeout for new connections
  allowExitOnIdle: true,      // Allow process to exit when idle
});
const adapter = new PrismaPg(pool);

// Prisma client with performance optimizations
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ["error", "warn"] : ["error"],
    // Remove query logging in production for better performance
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
