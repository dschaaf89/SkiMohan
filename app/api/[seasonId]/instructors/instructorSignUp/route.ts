import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function POST(req: Request) {

  console.log('Request received:', req);

  try {
    const body = await req.json();
    console.log('Instructor Sign-Up Request:', body);
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
      classTimeIds, // This should be an array of selected classTime IDs
      seasonId
    } = body;

    if (!seasonId) {
      return new NextResponse("Season ID is required", { status: 400 });
    }

    // Create the Instructor and associate it with the season
    const instructor = await prismadb.instructor.create({
      data: {
        NAME_FIRST,
        NAME_LAST,
        HOME_TEL,
        BRTHD: new Date(BRTHD), // Ensure BRTHD is a Date object
        AGE,
        E_mail_main,
        ADDRESS,
        CITY,
        STATE,
        ZIP,
        InstructorType,
        STATUS: "Pre-Registered",
        season: { connect: { id: seasonId } },
        customer:{connect:{id:userId}},
      },
    });

    // Associate the instructor with clinics
    if (clinics && clinics.length > 0) {
      for (const clinicId of clinics) {
        await prismadb.instructorClinic.create({
          data: {
            instructor: { connect: { UniqueID: instructor.UniqueID } },
            clinic: { connect: { id: parseInt(clinicId, 10) } }, // Convert to int
          },
        });
      }
    }

    // Associate the instructor with class times
    if (classTimeIds && classTimeIds.length > 0) {
      for (const classTimeId of classTimeIds) {
        await prismadb.instructorClassTime.create({
          data: {
            instructor: { connect: { UniqueID: instructor.UniqueID } },
            classTime: { connect: { id: classTimeId } },
          },
        });
      }
    }
    
    console.log('Instructor created successfully:', instructor);
    return NextResponse.json(instructor);
  } catch (error) {
    console.log('[InstructorSignUp_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
