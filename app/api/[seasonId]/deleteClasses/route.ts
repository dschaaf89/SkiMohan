import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prismadb from '@/lib/prismadb';

export async function DELETE(
  req: Request,
  { params }: { params: { seasonId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.seasonId) {
      return new NextResponse("Season ID is required", { status: 400 });
    }

    // Delete all classes for the specified season
    await prismadb.classes.deleteMany({
      where: { seasonId: params.seasonId }
    });
    console.log("All classes for the season deleted");

    return new NextResponse("All classes deleted successfully", { status: 200 });
  } catch (error) {
    console.error('[DELETE Classes Error]', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
