import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params, query }: { params: { seasonId: string }; query: any }
) {
  try {
    // Extracting the lastName query parameter
    const { lastName } = query;

    // If lastName is provided, perform a search; otherwise, return all students in the season
    if (lastName) {
      const students = await prismadb.student.findMany({
        where: {
          NAME_LAST: {
            contains: lastName,
          },
          seasonId: params.seasonId,
        },
      });
      
      return NextResponse.json(students);
    } else {
      const students = await prismadb.student.findMany({
        where: {
          seasonId: params.seasonId,
        },
      });
      return NextResponse.json(students);
    }
  } catch (error) {
    console.log("[Students_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
