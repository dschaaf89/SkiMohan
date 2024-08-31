import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';
 
export async function POST(
  req: Request,
  { params }: { params: { seasonId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { name, imageUrl} = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }
    
    if (!imageUrl) {
      return new NextResponse("Billboard ID is required", { status: 400 });
    }

    if (!params.seasonId) {
      return new NextResponse("season id is required", { status: 400 });
    }

    // const seasonByUserId = await prismadb.season.findFirst({
    //   where: {
    //     id: params.seasonId,
    //     userId,
    //   }
    // });

    // if (!seasonByUserId) {
    //   return new NextResponse("Unauthorized", { status: 405 });
    // }

    const programs = await prismadb.program.create({
      data: {
        name,
        imageUrl,
      
      }
    });
  
    return NextResponse.json(programs);
  } catch (error) {
    console.log('[CATEGORIES_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function GET(
  req: Request,
  { params }: { params: { seasonId: string } }
) {
  try {
    if (!params.seasonId) {
      return new NextResponse("season id is required", { status: 400 });
    }

    const categories = await prismadb.program.findMany({
    
    });
  
    return NextResponse.json(categories);
  } catch (error) {
    console.log('[CATEGORIES_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};