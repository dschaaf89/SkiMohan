import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const season = await prismadb.season.findFirst({
    where: {
      userId,
    }
  });

  if (season) {
    redirect(`/${season.id}`);
  };

  return (
    <>
      {children}
    </>
  );
};