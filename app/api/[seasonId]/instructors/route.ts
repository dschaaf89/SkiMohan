import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { seasonId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();
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

    const instructor = await prismadb.instructor.create({
      data: {
       ...otherData,
       clinics:validatedClinics,
       ageRequestByStaff:validatedAgeRequestByStaff,
        seasonId: params.seasonId,
        classTimes: {
          createMany: {
            data: classTimeIds.map((classTimeId: number) => ({
              classTimeId,
            }))
          },
        },
      },
      include: {
        classTimes: true, // Include the related classTimes in the result
      },
    });
    console.log(instructor); 

    return NextResponse.json(instructor);
  } catch (error) {
    console.log("[Instructors_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
