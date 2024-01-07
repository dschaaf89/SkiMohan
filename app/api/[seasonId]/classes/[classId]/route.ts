import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(req: Request, { params }: { params: { classId: number } }) {
  try {
    const classData = await prismadb.classes.findUnique({
      where: { classId: params.classId },
      include: {
        instructor: true, // include instructor details
        assistant: true,  // include assistant details
        // ... other fields you need
      }
    });

    return NextResponse.json(classData);
  } catch (error) {
    console.error('[Classes_GET]', error);
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

    const classes = await prismadb.classes.delete({
      where: {
        classId: params.classId,
      }
    });
  
    return NextResponse.json(classes);
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
    console.log('Received params:', params);
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }
    const body = await req.json();
    console.log("Received body:", body); // Log the entire body
    console.log("Params:", params); // Log the params
    const { classId:classId,instructorId, assistantId, ...updateData } = body;
    
    console.log("Body classId:", classId); // Log classId from body
    console.log("Params classId:", params.classId); // Log classId from params

    if (!params.classId) {
      return new NextResponse("Class id is required", { status: 400 });
    }

    const updatedClass = await prismadb.classes.update({
      where: {
        classId: classId,
      },
      data: {
        ...updateData, // Spread the body to update fields
        //seasonId: params.seasonId, // Assuming you still want to set this explicitly
      }
    });
    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('[Class_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};