import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    if (!params.studentId) {
      return new NextResponse("Student id is required", { status: 400 });
    }

    const student = await prismadb.student.findUnique({
      where: {
        id: params.studentId
      }
    });
  
    return NextResponse.json(student);
  } catch (error) {
    console.log('[Student_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { studentId: string, seasonId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.studentId) {
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

    const student = await prismadb.student.delete({
      where: {
        id: params.studentId,
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
  { params }: { params: { studentId: string, seasonId: string } }
) {
  try {   
    const { userId } = auth();

    const body = await req.json();
    
    const { id, NAME_FIRST, NAME_LAST,ADDRESS,CITY,STATE,HOME_TEL,ZIP,Email_student,GradeLevel,BRTHD,APPLYING_FOR,AGE,LEVEL,AppType,         
      Approach,       
      ProgCode,       
      BUDDY,          
      WComment,       
      DateFeePaid,    
      AGRESSIVENESS,  
      GENDER, 
      DAY,
      StartTime,
      EndTime,      } = body;
    
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!NAME_FIRST) {
      return new NextResponse("Label is required", { status: 400 });
    }

    if (!NAME_LAST) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    if (!params.studentId) {
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

    const student = await prismadb.student.update({
      where: {
        id: params.studentId,
      },
      data: {
        id,
        NAME_FIRST,
        NAME_LAST,
        ADDRESS,
        STATE,
        CITY,
        ZIP,
        HOME_TEL,
        Email_student,
        GradeLevel,
        BRTHD,
        AGE,
        APPLYING_FOR,
        AppType,
        LEVEL,         
        Approach,       
        ProgCode,       
        BUDDY,          
        WComment,       
        DateFeePaid,    
        AGRESSIVENESS,  
        GENDER,
        DAY,
        StartTime,
        EndTime,      
        seasonId: params.seasonId,
      }
    });
  
    return NextResponse.json(student);
  } catch (error) {
    console.log('[Student_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};