import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    // Retrieve classTimeId from the query string
    const url = new URL(req.url);
    const classTimeId = url.searchParams.get('classTimeId');

    console.log(`Received classTimeId: ${classTimeId}`);

    if (!classTimeId) {
      throw new Error('classTimeId is required');
    }

    const numericClassTimeId = Number(classTimeId);
    
    console.log(`Fetching instructor class times for classTimeId: ${numericClassTimeId}...`);
    const instructorClassTimes = await prismadb.instructorClassTime.findMany({
      where: { classTimeId: numericClassTimeId }
    });
    console.log(`Instructor class times found: ${instructorClassTimes.length}`);
    console.log('Instructor class times:', instructorClassTimes);

    const instructorUniqueIds = instructorClassTimes.map(ict => ict.instructorId);
   
    const instructors = await prismadb.instructor.findMany({
      where: {
        UniqueID: { in: instructorUniqueIds },
        InstructorType: {
          notIn: ["Ski Assistant", "Board Assistant", "Ski and Board Assistant"], // Exclude these roles
        },
      },
    });
    console.log(`Instructors found: ${instructors.length}`);
    

    return NextResponse.json(instructors);
  } catch (error) {
    console.log('[Classes_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
