import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';
import Navbar from '@/components/navbar';

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { seasonId: string }
}){
  const{ userId } = auth();

  if(!userId){
    redirect('/sign-in');
  }

  const season = await prismadb.season.findFirst({
    where: {
      id: params.seasonId,
     
    }
  });
  if(!season){
    redirect('/')
  }
    return (
      <>
        <Navbar/>
        {children}
      </>
    );
  };