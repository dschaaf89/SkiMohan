import { format } from "date-fns";

import prismadb from "@/lib/prismadb";
import { Button } from "@/components/ui/button";
import { ClassColumn,StudentDetails } from "./components/columns"
import { ClassClient } from "./components/client";
import { z } from "zod";


type StudentsType = {
  connect: { id: string }[];
};

const fetchStudentDetails = async (studentIds: string[]): Promise<StudentDetails[]> => {
  try {
    const students = await prismadb.student.findMany({
      where: {
        id: {
          in: studentIds,
        },
      },
      select: {
        id: true,
        NAME_FIRST: true,
        NAME_LAST: true,
        // ... select other fields you need ...
      },
    });

    return students;
  } catch (error) {
    console.error('Error fetching student details:', error);
    throw error; // or handle the error as appropriate for your application
  }
}

const ClassesPage = async ({ params }: { params: { seasonId: string } }) => {

  const classes = await prismadb.classes.findMany({
    where: {
      seasonId: params.seasonId
    }
  });

  const formattedClassesPromises = classes.map(async (item) => {
    let studentsFormatted: StudentDetails[] = [];

    if (item.students && typeof item.students === 'object' && 'connect' in item.students) {
      const studentsObject = item.students as { connect: { id: string }[] };
      const studentIds = studentsObject.connect.map(connection => connection.id);

      studentsFormatted = await fetchStudentDetails(studentIds);
    }
    return {
      DAY: item.day || "",
      classId: item.classId || 0,
      meetColor: item.meetColor || "",
      meetingPoint: item.meetingPoint || 0,
      discipline: item.discipline || "",
      numberStudents: item.numberStudents || 0,
      Level: item.Level || "",
      Age: item.Age || 0,
      instructorID: Number(item.instructorId),
      progCode: item.progCode || "",
      assistantId: Number(item.assistantId),
      instructorName: item.instructorName || "",
      instructorPhone: item.instructorPhone || "",
      startTime: item.startTime || "",
      endTime: item.endTime || "",
      students: studentsFormatted
    };
  });


  const formattedClasses = await Promise.all(formattedClassesPromises);
  return (
    <div className="flex-col">
      <div className=" flex-1 space-y-4 p-8 pt-6">
        <h1 className="text-center">Classes</h1>
        <ClassClient data={formattedClasses}/>
      </div>
    </div>
  );
};

export default ClassesPage
