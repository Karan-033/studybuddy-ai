import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
    // Optimize connection pool for serverless/free-tier
    log: ['error', 'warn'],
});

export default prisma;
