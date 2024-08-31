import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';
import { c } from 'tar';

const setCORSHeaders = (response: NextResponse) => {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Allow-Credentials", "true");
};

export async function OPTIONS() {
  const response = new NextResponse(null, {
    status: 204,
  });
  setCORSHeaders(response);
  return response;
}

export async function POST(
  req: Request,
  { params }: { params: { seasonId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { label, imageUrl } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!label) {
      return new NextResponse("Label is required", { status: 400 });
    }

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    if (!params.seasonId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    // const storeByUserId = await prismadb.season.findFirst({
    //   where: {
    //     id: params.seasonId,
    //     userId,
    //   }
    // });

    // if (!storeByUserId) {
    //   return new NextResponse("Unauthorized", { status: 405 });
    // }

    const billboard = await prismadb.billboard.create({
      data: {
        label,
        imageUrl,
        
      }
    });
  
    return NextResponse.json(billboard);
  } catch (error) {
    console.log('[BILLBOARDS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
export async function GET(
  req: Request,
  { params }: { params: { seasonId: string } }
) {
  try {
    if (!params.seasonId) {
      const response = new NextResponse("Store id is required", { status: 400 });
      setCORSHeaders(response);
      return response;
    }

    const billboards = await prismadb.billboard.findMany({
   
    });

    const response = NextResponse.json(billboards);
    setCORSHeaders(response);
    return response;
  } catch (error) {
    console.log('[BILLBOARDS_GET]', error);
    const response = new NextResponse("Internal error", { status: 500 });
    setCORSHeaders(response);
    return response;
  }
};