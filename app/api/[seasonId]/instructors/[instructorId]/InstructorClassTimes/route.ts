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
    
    const instructorClassTimes = await prismadb.instructorClassTime.findMany({
      where: { instructorId: params.instructorId },
    });

    if (!instructorClassTimes) {
      return new NextResponse("Instructor not found", { status: 404 });
    }

    // Return the instructor as JSON response
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