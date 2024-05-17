import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { programId: string } }
) {
  try {
    if (!params.programId) {
      return new NextResponse("program id is required", { status: 400 });
    }

    const programs = await prismadb.program.findUnique({
      where: {
        id: params.programId
      },
    });
  
    return NextResponse.json(programs);
  } catch (error) {
    console.log('[program_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { programId: string, seasonId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.programId) {
      return new NextResponse("program id is required", { status: 400 });
    }

    // const storeByUserId = await prismadb.store.findFirst({
    //   where: {
    //     id: params.storeId,
    //     userId,
    //   }
    // });

    // if (!storeByUserId) {
    //   return new NextResponse("Unauthorized", { status: 405 });
    // }

    const programs = await prismadb.program.delete({
      where: {
        id: params.programId,
      }
    });
  
    return NextResponse.json(programs);
  } catch (error) {
    console.log('[program_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


export async function PATCH(
  req: Request,
  { params }: { params: { programId: string, seasonId: string } }
) {
  try {   
    const { userId } = auth();

    const body = await req.json();
    
    const { name, imageUrl, } = body;
    
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!imageUrl) {
      return new NextResponse("Billboard ID is required", { status: 400 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.programId) {
      return new NextResponse("program id is required", { status: 400 });
    }

    // const storeByUserId = await prismadb.store.findFirst({
    //   where: {
    //     id: params.storeId,
    //     userId,
    //   }
    // });

    // if (!storeByUserId) {
    //   return new NextResponse("Unauthorized", { status: 405 });
    // }

    const programs = await prismadb.program.update({
      where: {
        id: params.programId,
      },
      data: {
        name,
        imageUrl,
      }
    });
  
    return NextResponse.json(programs);
  } catch (error) {
    console.log('[program_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};