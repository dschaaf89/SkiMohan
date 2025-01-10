import { format } from "date-fns";

import prismadb from "@/lib/prismadb";
import { Button } from "@/components/ui/button";
import { ClassColumn,StudentDetails } from "./components/columns"
import { ClassClient } from "./components/client";
import { z } from "zod";


type StudentsType = {
  connect: { UniqueID?: number; oldIds?: string }[];
};

const fetchStudentDetails = async (studentIds: (number | string)[]): Promise<StudentDetails[]> => {
  try {
    // Separate numeric IDs (UniqueID) and string IDs (oldIds)
    const numericIds = studentIds.filter(id => typeof id === "number") as number[];
    const stringIds = studentIds.filter(id => typeof id === "string") as string[];

    // Fetch students by UniqueID and oldIds
    let students = await prismadb.student.findMany({
      where: {
        OR: [
          {
            UniqueID: {
              in: numericIds,
            },
          },
          {
            oldIds: {
              in: stringIds,
            },
          },
        ],
      },
      select: {
        UniqueID: true,
        oldIds: true,
        NAME_FIRST: true,
        NAME_LAST: true,
      },
    });

    // Add the 'id' field for compatibility
    return students.map(student => ({
      id: student.UniqueID || (Array.isArray(student.oldIds) ? student.oldIds[0] : student.oldIds), // Use UniqueID if available, otherwise use the first oldId as fallback
      UniqueID: student.UniqueID,
      NAME_FIRST: student.NAME_FIRST,
      NAME_LAST: student.NAME_LAST,
      oldIds: student.oldIds,
    }));
  } catch (error) {
    console.error("Error fetching student details:", error);
    throw error;
  }
};
const ClassesPage = async ({ params }: { params: { seasonId: string } }) => {
  // Fetch all instructors
  const instructors = await prismadb.instructor.findMany({
    select: {
      UniqueID: true, // or instructorID based on your schema
      NAME_FIRST: true,
      NAME_LAST: true,
      HOME_TEL: true,
    },
  });

  const classes = await prismadb.classes.findMany({
    where: {
      seasonId: params.seasonId,
    },
  });

  // Format classes without fetching instructor details on the server
  const formattedClassesPromises = classes.map(async (item) => {
    // Handle 'oldStudents' if 'students' is not directly available
    const studentIds = Array.isArray(item.oldStudents)
      ? (item.oldStudents as string[]).filter((id) => typeof id === "string" || typeof id === "number")
      : [];

    const studentsFormatted = await fetchStudentDetails(studentIds as (string | number)[]);

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
      startTime: item.startTime || "",
      endTime: item.endTime || "",
      students: studentsFormatted,
    };
  });

  const formattedClasses = await Promise.all(formattedClassesPromises);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h1 className="text-center">Classes</h1>
        {/* Pass both formattedClasses and instructors to the client */}
        <ClassClient data={formattedClasses} instructors={instructors} />
      </div>
    </div>
  );
};

export default ClassesPage;