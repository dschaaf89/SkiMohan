import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs'


import prismadb from '@/lib/prismadb';




export async function POST(
  req: Request,
  { params }: { params: { seasonId: string } }
) {
  console.log('POST function called'); // Add this line
  try {
    const { userId } = auth();
    console.log('User ID:', userId); 
    const body = await req.json();
    console.log('Request Body:', body);
    const {
      NAME_FIRST,
      NAME_LAST,
      HOME_TEL,
      ADDRESS,
      CITY,
      STATE,
      ZIP,
      student_tel,
      Email_student,
      BRTHD,
      GradeLevel,
      APPLYING_FOR,
      LEVEL,
      Approach,
      E_mail_main,
      E_NAME,
      E_TEL,
      CCPayment,
      ProgCode,
      BUDDY,
      WComment,
      DateFeePaid,
      PaymentStatus,
      AcceptedTerms,
      AppType,
      Employer,
      C_TEL,
      Occupation,
      W_TEL,
      AGE,
      AGRESSIVENESS,
      AGE_GROUP,
      GENDER,
      FeeComment,
      DAY,
      StartTime,
      EndTime,
      customerId,
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

    

    const student = await prismadb.student.create({
      data: {
      
        NAME_FIRST,
        NAME_LAST,
        HOME_TEL,
        ADDRESS,
        CITY,
        STATE,
        ZIP,
        student_tel,
        Email_student,
        BRTHD,
        GradeLevel,
        APPLYING_FOR,
        LEVEL,
        Approach,
        E_mail_main,
        E_NAME,
        E_TEL,
        CCPayment,
        ProgCode,
        BUDDY,
        WComment,
        DateFeePaid,
        PaymentStatus,
        AcceptedTerms,
        AppType,
        Employer,
        C_TEL,
        Occupation,
        W_TEL,
        AGE,
        AGE_GROUP,
        GENDER,
        AGRESSIVENESS,
        FeeComment,
        DAY,
        StartTime,
        EndTime,
        customerId,
        seasonId: params.seasonId,
      },
    });
    console.log('Student Created:', student);
    return NextResponse.json(student);
  } catch (error) {
    console.log('[Students_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}