import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    const { selectedDay, seasonId } = await req.json(); 
    console.log(`Received day: ${selectedDay}, seasonId: ${seasonId}`);

    if (!selectedDay || !seasonId) {
      throw new Error("Day and seasonId are required");
    }

    // Step 1: Fetch class times based on the selected day
    const classTimes = await prismadb.classTime.findMany({
      where: {
        day: selectedDay,
      },
    });
    const classTimeIds = classTimes.map((ct) => ct.id);

    // Step 2: Fetch InstructorClassTimes by classTimeId
    const instructorClassTimes = await prismadb.instructorClassTime.findMany({
      where: {
        classTimeId: { in: classTimeIds },
      },
    });

    // Extract instructor IDs from InstructorClassTime entries
    const instructorIds = instructorClassTimes.map((ict) => ict.instructorId);

    // Step 3: Fetch instructors based on seasonId and filtered instructor IDs
    const instructors = await prismadb.instructor.findMany({
      where: {
        UniqueID: { in: instructorIds },
        seasonId: seasonId, // Apply season filter here in the Instructor table
      },
      include: {
        classes: true,
        classTimes: {
          include: {
            classTime: true,
          },
        },
      },
    });

    console.log(`Instructors found: ${instructors.length}`);

    return new NextResponse(JSON.stringify(instructors), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Classes_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
