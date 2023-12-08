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

    const {     
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
    } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!NAME_FIRST) {
      return new NextResponse("Label is required", { status: 400 });
    }

    if (!NAME_LAST) {
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

    const student = await prismadb.instructor.create({
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
        AGE,    // Add missing properties with default values if needed
    
        seasonId: params.seasonId,
      },
    });
  
    return NextResponse.json(student);
  } catch (error) {
    console.log('[Instructors_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};