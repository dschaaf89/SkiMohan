import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { instructorId: string } }
) {
  try {
    if (!params.instructorId) {
      return new NextResponse("instructor id is required", { status: 400 });
    }

    const instructor = await prismadb.instructor.findUnique({
      where: {
        id: params.instructorId
      }
    });
  
    return NextResponse.json(instructor);
  } catch (error) {
    console.log('[intstructor_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { instructorId: string, seasonId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.instructorId) {
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

    const instructor = await prismadb.instructor.delete({
      where: {
        id: params.instructorId,
      }
    });
  
    return NextResponse.json(instructor);
  } catch (error) {
    console.log('[instructor_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


export async function PATCH(
  req: Request,
  { params }: { params: { instructorId: string, seasonId: string } }
) {
  try {   
    const { userId } = auth();

    const body = await req.json();
    
    const { UniqueID,
      NAME_FIRST,
      NAME_LAST,
      HOME_TEL,
      C_TEL,
      BRTHD,
      E_mail_main,
      ADDRESS,
      CITY,
      STATE,
      ZIP,
      GENDER,
      AGE,      } = body;
    
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!NAME_FIRST) {
      return new NextResponse("Label is required", { status: 400 });
    }

    if (!NAME_LAST) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    if (!params.instructorId) {
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

    const instructor = await prismadb.instructor.update({
      where: {
        id: params.instructorId,
      },
      data: {
        UniqueID,
        NAME_FIRST,
        NAME_LAST,
        HOME_TEL,
        C_TEL,
        BRTHD,
        E_mail_main,
        ADDRESS,
        CITY,
        STATE,
        ZIP,
        GENDER,
        AGE,
        seasonId: params.seasonId,
      }
    });
  
    return NextResponse.json(instructor);
  } catch (error) {
    console.log('[instructor_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};