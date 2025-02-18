import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(req: Request, { params }: { params: { classId: number } }) {
  try {
    const classData = await prismadb.classes.findUnique({
      where: { classId: params.classId },
      // include: {
      //   instructor: true, // include instructor details
      //   assistant: true,  // include assistant details
      //   // ... other fields you need
      // }
    });

    return NextResponse.json(classData);
  } catch (error) {
    console.error('[Classes_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { classId: string, seasonId: string } }
) {
  try {
    const { userId } = auth();
    const classId = parseInt(params.classId, 10);
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.classId) {
      return new NextResponse("Billboard id is required", { status: 400 });
    }

    // const storeByUserId = await prismadb.season.findFirst({
    //   where: {
    //     id: params.seasonId,
    //     userId,
    //   }
    // });

    // if (!storeByUserId) {
    //   return new NextResponse("Unauthorized", { status: 405 });
    // }

    const classes = await prismadb.classes.delete({
      where: {
        classId: classId,
      }
    });
  
    return NextResponse.json(classes);
  } catch (error) {
    console.log('[BILLBOARD_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
export async function PATCH(
  req: Request,
  { params }: { params: { classId: string; seasonId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    const body = await req.json();
    const {
      meetingPoint,
      instructorID,
      assistantId,
      instructorName,
      instructorPhone,
      assistantName,
      ...updateData
    } = body;

    // Parse the classId
    const parsedClassId = parseInt(params.classId, 10);
    if (isNaN(parsedClassId)) {
      return new NextResponse("Invalid classId provided", { status: 400 });
    }

    // Build the data to update, excluding the classId
    const dataToUpdate = {
      ...updateData,
      instructorId: instructorID || null,
      assistantId: assistantId || null,
      instructorName: instructorName || null,
      instructorPhone: instructorPhone || null,
      assistantName: assistantName || null,
      meetingPoint: meetingPoint || null, // Ensure lowercase 'm' for meetingPoint
    };

    // Perform the class update
    const updatedClass = await prismadb.classes.update({
      where: { classId: parsedClassId },
      data: dataToUpdate,
    });

    // Find students in the class
    const studentsInClass = await prismadb.student.findMany({
      where: { classId: parsedClassId },
    });

    if (!studentsInClass || studentsInClass.length === 0) {
      console.warn(`No students found in class with ID ${parsedClassId}`);
    } else {
      // Update each student's meetingPoint and meetColor
      const updatePromises = studentsInClass.map((student) =>
        prismadb.student.update({
          where: { UniqueID: student.UniqueID },
          data: {
            meetingPoint: meetingPoint || student.meetingPoint, // Use the new meetingPoint if provided
            meetColor: updatedClass.meetColor || student.meetColor, // Use the new meetColor if provided
          },
        })
      );

      // Wait for all updates to complete
      await Promise.all(updatePromises);
    }

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error("[Class_PATCH] Error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}