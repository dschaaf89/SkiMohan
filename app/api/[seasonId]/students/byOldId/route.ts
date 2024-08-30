import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(req: Request, { params }: { params: { seasonId: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const oldIds = searchParams.get('oldIds')?.split(',') || []; // Split the joined oldIds back to an array

    if (!oldIds.length) {
      return new NextResponse("oldIds are required", { status: 400 });
    }

    const students = await prismadb.student.findMany({
      where: {
        oldIds: {
          in: oldIds,
        },
      },
    });

    if (!students.length) {
      return new NextResponse("Students not found", { status: 404 });
    }

    console.log('Received Params:', params);
    console.log('Received oldIds:', oldIds);

    return NextResponse.json(students);
  } catch (error) {
    console.error('[GET_Students_by_oldIds]', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
