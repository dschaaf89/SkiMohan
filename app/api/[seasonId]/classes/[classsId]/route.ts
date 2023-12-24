import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { classId: number } }
) {
  try {
    if (!params.classId) {
      return new NextResponse("Class id is required", { status: 400 });
    }
    
    const student = await prismadb.classes.findUnique({
      where: {
        classId: params.classId
      }
    });
  
    return NextResponse.json(student);
  } catch (error) {
    console.log('[Classes_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { classId: number, seasonId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.classId) {
      return new NextResponse("Billboard id is required", { status: 400 });
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

    const student = await prismadb.classes.delete({
      where: {
        classId: params.classId,
      }
    });
  
    return NextResponse.json(student);
  } catch (error) {
    console.log('[BILLBOARD_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


export async function PATCH(
  req: Request,
  { params }: { params: { classId: number, seasonId: string } }
) {
  try {   
    const { userId } = auth();

    const body = await req.json();
    
    const {       } = body;
    
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }


    if (!params.classId) {
      return new NextResponse("student id is required", { status: 400 });
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

    const classes = await prismadb.classes.update({
      where: {
        classId: params.classId,
      },
      data: {

        seasonId: params.seasonId,
      }
    });
  
    return NextResponse.json(classes);
  } catch (error) {
    console.log('[Student_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};