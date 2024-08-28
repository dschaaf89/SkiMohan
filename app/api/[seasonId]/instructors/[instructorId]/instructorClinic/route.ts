import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { instructorId: string } }
) {
  try {
    const instructorClinics = await prismadb.instructorClinic.findMany({
      where: {
        instructorId: parseInt(params.instructorId), // Assuming `instructorId` is an integer
      },
      include: {
        clinic: true, // Include clinic details if needed
      },
    });

    if (!instructorClinics) {
      return new NextResponse("Clinics not found", { status: 404 });
    }

    return NextResponse.json(instructorClinics);
  } catch (error) {
    console.error("[instructorClinic_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}