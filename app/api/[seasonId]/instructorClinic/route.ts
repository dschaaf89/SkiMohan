import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    // Query the InstructorClinic table, including associated clinic data
    const instructorClinics = await prismadb.instructorClinic.findMany({
      include: {
        clinic: true, // Include the clinic details
        instructor: true, // Optionally include the instructor details
      },
    });

    // Return the instructorClinics data as a JSON response
    return new NextResponse(JSON.stringify(instructorClinics), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching instructor clinics:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
