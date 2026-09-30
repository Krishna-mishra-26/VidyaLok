const { PrismaClient } = require('@prisma/client');

(async () => {
  try {
    console.log('PRISMA_CLIENT_ENGINE_TYPE:', process.env.PRISMA_CLIENT_ENGINE_TYPE);
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('Connected successfully');

    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
      select: { id: true, studentId: true, name: true },
    });

    console.log('Sample student:', student);

    if (student) {
      const openLogs = await prisma.entryLog.findMany({
        where: { userId: student.id, exitTime: null },
        orderBy: { entryTime: 'desc' },
        take: 3,
      });

      const recentLogs = await prisma.entryLog.findMany({
        where: { userId: student.id },
        orderBy: { entryTime: 'desc' },
        take: 5,
      });

      console.log('Open logs:', openLogs);
      console.log('Recent logs:', recentLogs);
    }

    console.log('Diagnostics complete');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Prisma error:', error);
    process.exitCode = 1;
  }
})();
