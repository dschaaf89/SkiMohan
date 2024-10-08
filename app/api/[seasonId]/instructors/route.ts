import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  console.log("Request received:", req);

  try {
    const body = await req.json();
    console.log("Instructor Sign-Up Request Body:", body);

    const {
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
      clinics,        // Optional
      classTimeIds,   // Optional
      seasonId,
             // Ensure this is included in the body for customer association
    } = body;

    // Log missing fields
    if (!seasonId) {
      console.log("Missing seasonId");
      return new NextResponse("Season ID is required", { status: 400 });
    }

    if (!NAME_FIRST || !NAME_LAST) {
      return new NextResponse("First and Last names are required", { status: 400 });
    }

    // Creating the instructor entry
    console.log("Creating Instructor...");
    const instructor = await prismadb.instructor.create({
      data: {
        NAME_FIRST,
        NAME_LAST,
        HOME_TEL,
        BRTHD: new Date(BRTHD), // Make sure to pass the BRTHD correctly
        AGE,
        E_mail_main,
        ADDRESS,
        CITY,
        STATE,
        ZIP,
        InstructorType: InstructorType || null, // Allow empty string or null
        STATUS: "Pre-Registered",
        season: { connect: { id: seasonId } }, // Connect instructor to season
 // Connect instructor to customer
      },
    });
    console.log("Instructor created successfully:", instructor);

    // Handling clinics association only if clinics are provided
    if (clinics && clinics.length > 0) {
      console.log("Associating clinics:", clinics);
      for (const clinicId of clinics) {
        await prismadb.instructorClinic.create({
          data: {
            instructor: { connect: { UniqueID: instructor.UniqueID } }, // Associate clinic with instructor
            clinic: { connect: { id: parseInt(clinicId, 10) } }, // Convert clinicId to integer
          },
        });
      }
    } else {
      console.log("No clinics provided, skipping clinic association.");
    }

    // Handling class times association only if classTimeIds are provided
    if (classTimeIds && classTimeIds.length > 0) {
      console.log("Associating class times:", classTimeIds);
      for (const classTimeId of classTimeIds) {
        await prismadb.instructorClassTime.create({
          data: {
            instructor: { connect: { UniqueID: instructor.UniqueID } }, // Associate class time with instructor
            classTime: { connect: { id: classTimeId } }, // Ensure classTimeId is correctly referenced
          },
        });
      }
    } else {
      console.log("No class times provided, skipping class time association.");
    }

    console.log("Instructor and optional associations completed successfully.");
    return NextResponse.json(instructor);
  } catch (error) {
    console.error("[InstructorSignUp_POST] Error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
