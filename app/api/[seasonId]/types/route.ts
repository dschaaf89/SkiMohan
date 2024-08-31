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

    const { name, value } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!value) {
      return new NextResponse("Value is required", { status: 400 });
    }

    if (!params.seasonId) {
      return new NextResponse("season id is required", { status: 400 });
    }

    // const seasonByUserId = await prismadb.season.findFirst({
    //   where: {
    //     id: params.seasonId,
    //     userId
    //   }
    // });

    // if (!seasonByUserId) {
    //   return new NextResponse("Unauthorized", { status: 405 });
    // }

    const types = await prismadb.type.create({
      data: {
        name,
        value,
       
      }
    });
  
    return NextResponse.json(types);
  } catch (error) {
    console.log('[type_POST]', error);
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

    const types = await prismadb.type.findMany({
   
    });
  
    return NextResponse.json(types);
  } catch (error) {
    console.log('[type_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};