import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { instructorId: string } }
) {
  try {
    if (!params.instructorId) {
      return new NextResponse("Instructor ID is required", { status: 400 });
    }

    const instructor = await prismadb.instructor.findUnique({
      where: {
        UniqueID: parseInt(params.instructorId), // Assuming `UniqueID` is an integer
      },
      include: {
        clinics: true, // Include clinics if needed
        classTimes: true, // Include classTimes if needed
      },
    });

    if (!instructor) {
      return new NextResponse("Instructor not found", { status: 404 });
    }

    return NextResponse.json(instructor);
  } catch (error) {
    console.log("[instructor_GET]", error);
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
      return new NextResponse("Instructor ID is required", { status: 400 });
    }

    const instructor = await prismadb.instructor.delete({
      where: {
        UniqueID: parseInt(params.instructorId), // Assuming `UniqueID` is an integer
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
    
    const { clinics, classTimeIds, ageRequestByStaff, classes, ...otherData } = body;

    // Validate clinics and ageRequestByStaff
    const validatedClinics = Array.isArray(clinics) ? clinics : null;
    const validatedAgeRequestByStaff = Array.isArray(ageRequestByStaff) ? ageRequestByStaff : null;

    console.log("here is the validated Clinics:",validatedClinics)

    if (!params.instructorId) {
      return new NextResponse("Instructor ID is required", { status: 400 });
    }

    // Update instructor's general information
    const instructor = await prismadb.instructor.update({
      where: {
        UniqueID: parseInt(params.instructorId),
      },
      data: {
        ...otherData,
        ageRequestByStaff: validatedAgeRequestByStaff,
        seasonId: params.seasonId, // Use seasonId as string
      },
    });

    // Update clinics
    if (validatedClinics.length > 0) {
      try {
        // Disconnect all existing clinics
        await prismadb.instructorClinic.deleteMany({
          where: {
            instructorId: parseInt(params.instructorId),
          },
        });
    
        // Reconnect the selected clinics
        await Promise.all(
          validatedClinics.map(async (clinicId: number) => {
            await prismadb.instructorClinic.create({
              data: {
                instructorId: parseInt(params.instructorId),
                clinicId,
              },
            });
          })
        );
      } catch (error) {
        console.error("Error updating clinics:", error);
        throw new Error("Failed to update clinics");
      }
    }
    
    // Update class times
    if (classTimeIds) {
      // Disconnect all existing class times
      await prismadb.instructorClassTime.deleteMany({
        where: {
          instructorId: parseInt(params.instructorId),
        },
      });

      // Reconnect the selected class times
      await Promise.all(
        classTimeIds.map(async (classTimeId: number) => {
          await prismadb.instructorClassTime.create({
            data: {
              instructorId: parseInt(params.instructorId),
              classTimeId,
            },
          });
        })
      );
    }

    console.log("Instructor updated:", instructor);
    return NextResponse.json(instructor);
  } catch (error) {
    console.error("Error in PATCH route:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
