import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { instructorId: string } }
) {
  try {
    if (!params.instructorId) {
      return new NextResponse("Instructor ID is required", { status: 400 });
    }

    // Fetch the instructor's class times including related class time details
    const instructorClassTimes = await prismadb.instructorClassTime.findMany({
      where: { instructorId: parseInt(params.instructorId) }, // Assuming instructorId is now an integer
      include: {
        classTime: true, // Include the related classTime details
      },
    });

    if (!instructorClassTimes.length) {
      return new NextResponse("Instructor class times not found", { status: 404 });
    }

    // Return the instructor class times as JSON response
    return new NextResponse(JSON.stringify(instructorClassTimes), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[instructor_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
