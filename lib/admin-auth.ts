import { redirect } from 'next/navigation';
import { getSession } from './auth';
import { prisma } from './prisma';

export async function requireAdmin() {
  const session = await getSession();

  if (!session) {
    redirect('/giris?redirect=/admin');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user || user.role !== 'ADMIN') {
    redirect('/');
  }

  return user;
}

export async function checkAdmin() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return user;
}
