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
    const instructorClassTimes = await prismadb.instructorClassTime.findMany({
      where: { classTimeId: numericClassTimeId }
    });

    const instructorIds = instructorClassTimes.map(ict => ict.instructorId);
    const instructors = await prismadb.instructor.findMany({
      where: { id: { in: instructorIds } }
    });

    // Log the number of instructors found
    console.log(`Number of instructors found: ${instructors.length}`);

    return NextResponse.json(instructors);
  } catch (error) {
    console.log('[Classes_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
