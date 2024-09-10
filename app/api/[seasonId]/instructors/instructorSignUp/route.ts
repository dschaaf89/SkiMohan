import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function POST(req: Request) {
  console.log('Request received:', req);

  try {
    const body = await req.json();
    console.log('Instructor Sign-Up Request Body:', body);

    const {
      userId,
      NAME_FIRST,
      NAME_LAST,
      HOME_TEL,
      BRTHD,
      AGE,
      E_mail_main,
      ADDRESS,
      CITY,
      STATE,
      ZIP,
      InstructorType,
      clinics,
      classTimeIds,
      seasonId
    } = body;

    // Log missing fields
    if (!userId) console.log('Missing userId');
    if (!seasonId) return new NextResponse("Season ID is required", { status: 400 });

    // Creating instructor
    console.log('Creating Instructor...');
    const instructor = await prismadb.instructor.create({
      data: {
        NAME_FIRST,
        NAME_LAST,
        HOME_TEL,
        BRTHD: new Date(BRTHD),
        AGE,
        E_mail_main,
        ADDRESS,
        CITY,
        STATE,
        ZIP,
        InstructorType,
        STATUS: "Pre-Registered",
        season: { connect: { id: seasonId } },
        customer: { connect: { id: userId } },
      },
    });
    console.log('Instructor created successfully:', instructor);

    // Handling clinics
    if (clinics && clinics.length > 0) {
      console.log("Clinics associated:", clinics);
      for (const clinicId of clinics) {
        await prismadb.instructorClinic.create({
          data: {
            instructor: { connect: { UniqueID: instructor.UniqueID } },
            clinic: { connect: { id: parseInt(clinicId, 10) } },
          },
        });
      }
    }

    // Handling class times
    if (classTimeIds && classTimeIds.length > 0) {
      console.log("Class times associated:", classTimeIds);
      for (const classTimeId of classTimeIds) {
        await prismadb.instructorClassTime.create({
          data: {
            instructor: { connect: { UniqueID: instructor.UniqueID } },
            classTime: { connect: { id: classTimeId } },
          },
        });
      }
    }

    console.log('Instructor and associations completed successfully.');
    return NextResponse.json(instructor);
  } catch (error) {
    console.error('[InstructorSignUp_POST] Error:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
