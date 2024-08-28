import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    const { selectedDay } = await req.json();
    console.log(`Received day: ${selectedDay}`);

    if (!selectedDay) {
      throw new Error("Day is required");
    }

    console.log("Fetching class times...");
    const classTimes = await prismadb.classTime.findMany({
      where: { day: selectedDay },
    });
    console.log(`Class times found: ${classTimes.length}`);

    const classTimeIds = classTimes.map((ct) => ct.id);

    console.log("Fetching instructor class times...");
    const instructorClassTimes = await prismadb.instructorClassTime.findMany({
      where: { classTimeId: { in: classTimeIds } },
      include: {
        classTime: true,
      },
    });
    console.log(
      `Instructor class times found: ${instructorClassTimes.length}`
    );

    const instructorIds = instructorClassTimes.map((ict) => ict.instructorId);

    console.log("Fetching instructors...");
    const instructors = await prismadb.instructor.findMany({
      where: { UniqueID: { in: instructorIds } }, // Assuming instructor `UniqueID` is used for identification
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
