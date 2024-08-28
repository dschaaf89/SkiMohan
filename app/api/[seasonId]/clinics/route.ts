import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
) {
  try {
    // Query the clinics
    const clinics = await prismadb.clinic.findMany({
    });

    // Return the clinics as a JSON response
    return new NextResponse(JSON.stringify(clinics), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching clinics:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}