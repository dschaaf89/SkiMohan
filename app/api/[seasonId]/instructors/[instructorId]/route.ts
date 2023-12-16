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
        id: params.instructorId,
      },
    });

    return NextResponse.json(instructor);
  } catch (error) {
    console.log("[intstructor_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}


export async function DELETE(
  req: Request,
  { params }: { params: { instructorId: string; seasonId: string } }
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
      },
    });

    return NextResponse.json(instructor);
  } catch (error) {
    console.log("[instructor_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { instructorId: string; seasonId: string } }
  
) {
  try {
    const body = await req.json();
    console.log("Received data in PATCH route:", body);
    const { clinics,classTimeIds, ageRequestByStaff, ...otherData } = body;
    let validatedClinics;
    if (Array.isArray(clinics)) {
      validatedClinics = clinics.every(item => typeof item === 'string')
        ? clinics
        : null; // or handle the error
    } else if (clinics === null || clinics === undefined) {
      validatedClinics = null;
    } else {
      // Handle cases where `ageRequestByStaff` is not an array or null
      // Maybe return an error or set a default value
      validatedClinics = null; // or handle the error
    }
    let validatedAgeRequestByStaff;
    if (Array.isArray(ageRequestByStaff)) {
      validatedAgeRequestByStaff = ageRequestByStaff.every(item => typeof item === 'string')
        ? ageRequestByStaff
        : null; // or handle the error
    } else if (ageRequestByStaff === null || ageRequestByStaff === undefined) {
      validatedAgeRequestByStaff = null;
    } else {
      // Handle cases where `ageRequestByStaff` is not an array or null
      // Maybe return an error or set a default value
      validatedAgeRequestByStaff = null; // or handle the error
    }
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
      AGE,
      STATUS,
      COMMENTS,
      prevYear,
      dateReg,
      dateConfirmed,
      emailCommunication,
      InstructorType,
      PSIA,
      AASI,
      testScore,
      ParentAuth,
      OverNightLodge,
      clinicInstructor,
      Supervisor,
    } = body;



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
    console.log('Received data:', body);
    const instructor = await prismadb.instructor.update({
      where: {
        id: params.instructorId,
      },
      data: {
        ...otherData,
        clinics:validatedClinics,
       ageRequestByStaff:validatedAgeRequestByStaff,
        seasonId: params.seasonId,
        // Other updates...
        // Remove existing class times
        classTimes: {
          deleteMany: {
            instructorId: params.instructorId,
          },
        },
      },
    });
    
    // After removing existing class times, create new relations
    await Promise.all(
      classTimeIds.map((classTimeId: number) => 
        prismadb.instructorClassTime.create({
          data: {
            instructorId: params.instructorId,
            classTimeId: classTimeId,
          },
        })
      )
    );
    console.log("Instructor UPDATED!!!!!!!!!!!!!!!!!!!!!!!",instructor); 
    return NextResponse.json(instructor);
  } catch (error) {
    console.error("Error in PATCH route:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
