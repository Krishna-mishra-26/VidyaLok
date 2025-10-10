const { PrismaClient, Prisma } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
      select: { id: true, studentId: true, name: true },
    });

    if (!student) {
      console.log('No student found.');
      return;
    }

    console.log('Using student:', student);

    const now = new Date();
    const openLog = await prisma.entryLog.findFirst({
      where: { userId: student.id, exitTime: null },
      orderBy: { entryTime: 'desc' },
    });

    const openLogEquals = await prisma.entryLog.findFirst({
      where: { userId: student.id, exitTime: { equals: null } },
      orderBy: { entryTime: 'desc' },
    });

    const openLogDbNull = await prisma.entryLog.findFirst({
      where: { userId: student.id, exitTime: Prisma.DbNull },
      orderBy: { entryTime: 'desc' },
    });

    console.log('openLog (exitTime: null):', openLog);
    console.log('openLog (equals null):', openLogEquals);
    console.log('openLog (DbNull):', openLogDbNull);

    if (openLog) {
      const updated = await prisma.entryLog.update({
        where: { id: openLog.id },
        data: {
          exitTime: now,
          duration: 5,
        },
      });
      console.log('Updated log to exit:', updated);
    } else if (openLogEquals) {
      const updated = await prisma.entryLog.update({
        where: { id: openLogEquals.id },
        data: {
          exitTime: now,
          duration: 5,
        },
      });
      console.log('Updated log to exit via equals:', updated);
    } else if (openLogDbNull) {
      const updated = await prisma.entryLog.update({
        where: { id: openLogDbNull.id },
        data: {
          exitTime: now,
          duration: 5,
        },
      });
      console.log('Updated log to exit via DbNull:', updated);
    } else {
      const created = await prisma.entryLog.create({
        data: {
          userId: student.id,
          entryTime: now,
          entryPoint: 'Debug Entrance',
          entryMethod: 'manual',
          recordedBy: 'debug-script',
        },
      });
      console.log('Created entry log:', created);
    }

    const logs = await prisma.entryLog.findMany({
      where: { userId: student.id },
      orderBy: { entryTime: 'desc' },
      take: 5,
    });

    console.log('Recent logs:', logs);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();
