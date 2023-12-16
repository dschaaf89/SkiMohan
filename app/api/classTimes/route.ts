import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";


export async function GET(
  req: Request,
  
) {
  try {
    // Query the instructorClassTimes
    const classTimes = await prismadb.classTime.findMany({
    });
    // Return the instructorClassTimes as JSON response
    return new NextResponse(JSON.stringify(classTimes), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching instructor class times:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
