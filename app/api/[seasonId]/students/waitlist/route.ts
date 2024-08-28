import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      NAME_FIRST,
      NAME_LAST,
      HOME_TEL,
      ADDRESS,
      CITY,
      STATE,
      ZIP,
      Email_student,
      BRTHD,
      AGE,
      GradeLevel,
      LEVEL,
      E_mail_main,
      E_NAME,
      E_TEL,
      ProgCode,
      seasonId, // Expect seasonId from the request body
      status = 'Waitlist', // Default status to 'Waitlist' if not provided
    } = body;

    if (!seasonId) {
      return new NextResponse("Season ID is required", { status: 400 });
    }

    const student = await prismadb.student.create({
      data: {
        NAME_FIRST,
        NAME_LAST,
        HOME_TEL,
        ADDRESS,
        CITY,
        STATE,
        ZIP,
        student_tel: Email_student,
        BRTHD,
        AGE,
        GradeLevel,
        LEVEL,
        E_mail_main,
        E_NAME,
        E_TEL,
        ProgCode,
        season: { connect: { id: seasonId } }, // Connect the season using seasonId from the body
        status, // Include the status in the data being created
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.log('[StudentSignUp_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
