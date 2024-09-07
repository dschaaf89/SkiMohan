import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb'; // Ensure this points to your Prisma DB setup
export async function POST(req: Request) {
    try {
      const body = await req.json(); // Parse the JSON body
      const { userId } = body; // Extract userId from request body
  
      if (!userId) {
        return new NextResponse("User ID is required", { status: 400 });
      }
  
      // Fetch students for this user
      const students = await prismadb.student.findMany({
        where: {
          customerId: userId,
        },
        select: {
          NAME_FIRST: true,
          NAME_LAST: true,
          class: {
            select: {
              classId: true,
              instructor: {
                select: {
                  NAME_FIRST: true,
                  NAME_LAST: true,
                },
              },
              meetingPoint: true,
            },
          },
        },
      });
  
      const formattedStudents = students.map((student) => ({
        name: `${student.NAME_FIRST} ${student.NAME_LAST}`,
        classNumber: student.class?.classId,
        instructorName: `${student.class?.instructor?.NAME_FIRST} ${student.class?.instructor?.NAME_LAST}`,
        meetingPoint: student.class?.meetingPoint,
      }));
  
      return NextResponse.json(formattedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }
  