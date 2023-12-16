import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";




interface Student {
  id: string;
  DAY: string | null; // Adjusted to allow null
  APPLYING_FOR: string | null; // Adjusted to allow null
  AGE: number | null; // Adjusted to allow null
  LEVEL: string | null; // Adjusted to allow null
  ProgCode: string | null; // Adjusted to allow null
}

interface StudentGroup {
  day: string | null;
  applyingFor: string | null;
  age: number | null;
  level: string | null;
  discipline: string | null;
  numberStudents: number;
  meetColor: string | null;
  meetingPoint: number | null;
  students: Student[];
}
const fridayProgCodes = [
  'ECKS-S-LT', 'HAML-B-LT', 'HAML-S-LT', 'ECKS-B-LT', 'BALL-S-LT', 
  'JANE-S-LT', 'ROOS-S-LT', 'EAST-S-LT', 'WHIT-B-LT', 'BALL-B-LT', 
  'EAST-B-LT', 'LINC-S-LT', 'WHIT-S-LT', 'JANE-B-LT', 'NATH-S-LT'
];

const saturdayMagicKindomCodes = [
  'G715-S-LO','G725-S-LO',
];
const sundayMagicKindomCodes = [
  'G115-S-LO','G125-S-LO',
];

const saturdayCodes = [
  'G720-S-LO','G720-B-LO','G710-S-LO','G710-B-LO'
];

const sundayCodes = [
  'G110-S-LO','G110-B-LO','G120-B-LO','G120-S-LO'
];

function chunkArray<T>(array: T[], size: number): T[][] {
  return array.reduce((chunks, item, index) => {
    const chunkIndex = Math.floor(index / size);
    chunks[chunkIndex] = ([] as T[]).concat(chunks[chunkIndex] || [], item);
    return chunks;
  }, [] as T[][]);
}

// Function to group students by program code for Friday
// function groupForFriday(students: Student[]): StudentGroup[] {
//   const groups: StudentGroup[] = [];

//   fridayProgCodes.forEach(progCode => {
//     const studentsInProgram = students.filter(student => student.ProgCode === progCode);
//     const groupedByLevel = groupBy(studentsInProgram, 'LEVEL');
//     const levelGroups = groupedByLevel.flatMap(levelGroup => chunkArray(levelGroup, 5));

//     groups.push(...levelGroups.map(createStudentGroup));
//   });

//   return groups;
// }
function groupForFriday(students: Student[]): StudentGroup[] {
  const groups: StudentGroup[] = [];

  // Group students by discipline for Friday classes
  const groupedByDiscipline = groupBy(students, 'APPLYING_FOR');

  // Iterate through the groups and create StudentGroup objects
  for (const disciplineGroup of Object.values(groupedByDiscipline)) {
    const levelGroups = chunkArray(disciplineGroup, 5);
    groups.push(...levelGroups.map(createStudentGroup));
  }

  return groups;
}

// Function to group students by program code for Magic Kingdom classes
function groupForMagicKingdom(students: Student[], codes: string[]): StudentGroup[] {
  const groups: StudentGroup[] = [];

  codes.forEach(progCode => {
    const studentsInProgram = students.filter(student => student.ProgCode === progCode);
    const programGroups = chunkArray(studentsInProgram, 5);
    groups.push(...programGroups.map(createStudentGroup));
  });

  return groups;
}


// Function to group students by program code for regular Saturday and Sunday classes
function groupForRegularWeekend(students: Student[], codes: string[]): StudentGroup[] {
  const groups: StudentGroup[] = [];

  codes.forEach(progCode => {
    const studentsInProgram = students.filter(student => student.ProgCode === progCode);

    // Split students into two groups: aged 18 and older and under 18
    const olderThan18 = studentsInProgram.filter(student => student.AGE !== null && student.AGE >= 18);
    const under18 = studentsInProgram.filter(student => student.AGE !== null && student.AGE < 18);

    if (olderThan18.length > 0) {
      // Group students aged 18 and older by level
      const groupedByLevel18Plus = groupBy(olderThan18, 'LEVEL');
      
      for (const levelGroup of groupedByLevel18Plus) {
        const ageAndLevelGroup18Plus = chunkArray(levelGroup, 5);
        groups.push(...ageAndLevelGroup18Plus.map(createStudentGroup));
      }
    }

    if (under18.length > 0) {
      // Group students under 18 by level
      const groupedByLevelUnder18 = groupBy(under18, 'LEVEL');

      for (const levelGroup of groupedByLevelUnder18) {
        const ageAndLevelGroupUnder18 = chunkArray(levelGroup, 5);
        groups.push(...ageAndLevelGroupUnder18.map(createStudentGroup));
      }
    }
  });

  return groups;
}


// Helper function to group by multiple criteria
function groupByMultipleCriteria(students: Student[], criteria: (keyof Student)[]): Student[][] {
  // Start with the original list and progressively group by each criterion
  return criteria.reduce((grouped: Student[][], criterion: keyof Student) => {
    return grouped.flatMap(group => groupBy(group, criterion));
  }, [students]);
}

// Utility function to group an array of objects by a property
function groupBy<T>(array: T[], key: keyof T): T[][] {
  const groups: Record<string, T[]> = {};
  array.forEach((item) => {
    const groupKey = String(item[key]);
    groups[groupKey] = groups[groupKey] || [];
    groups[groupKey].push(item);
  });
  return Object.values(groups);
}

function createStudentGroup(students: Student[]): StudentGroup {
  // Implement logic to create a StudentGroup from an array of Students
  // Example implementation:
  const groupAge = students[0].AGE ?? 0;
  const meetColor = determineMeetColor(students[0]);
  const meetingPoint = determineMeetingPoint(students[0]);

  return {
    day: students[0].DAY ?? 'Unknown',
    applyingFor: students[0].APPLYING_FOR ?? 'Unknown',
    age: groupAge,
    level: students[0].LEVEL ?? 'Unknown',
    discipline: students[0].APPLYING_FOR ?? 'Unknown',
    numberStudents: students.length,
    meetColor,
    meetingPoint,
    students,
  };
}


function createGroupsFromStudents(studentBatches: Student[][]): StudentGroup[] {
  const flattenedStudents = studentBatches.flat();
  return [createStudentGroup(flattenedStudents)];
}
function determineMeetColor(student: Student): string {
  return student.APPLYING_FOR === "SKI" ? "Red" : "Blue";
}

let currentLowerMeetingPoint = 1; // Start from 1 for "1/2 novice" and "3/4 inter"
let currentUpperMeetingPoint = 30; // Start from 30 for other levels

function determineMeetingPoint(student: Student): number {
  if (student.LEVEL === "1/2 novice" || student.LEVEL === "3/4 inter") {
    if (currentLowerMeetingPoint > 29) {
      currentLowerMeetingPoint = 1; // Reset if it exceeds the range
    }
    return currentLowerMeetingPoint++;
  } else {
    if (currentUpperMeetingPoint > 50) {
      currentUpperMeetingPoint = 30; // Reset if it exceeds the range
    }
    return currentUpperMeetingPoint++;
  }
}

export async function POST(
  req: Request,
  { params }: { params: { seasonId: string } }
) {
  try {
    // Fetch all students
    const allStudents = await prismadb.student.findMany();
    const fridayGroups: StudentGroup[] = groupForFriday(allStudents);
    const saturdayMKGroups = groupForMagicKingdom(allStudents, saturdayMagicKindomCodes);
    const sundayMKGroups = groupForMagicKingdom(allStudents, sundayMagicKindomCodes);
    const saturdayRegularGroups = groupForRegularWeekend(allStudents, saturdayCodes);
    const sundayRegularGroups = groupForRegularWeekend(allStudents, sundayCodes);

    const combinedGroups = [...fridayGroups, ...saturdayMKGroups, ...sundayMKGroups, ...saturdayRegularGroups, ...sundayRegularGroups];
    // Iterate over the student groups and create classes in the database
    for (const group of combinedGroups) {
      // Extract student IDs for the class creation
      const studentIds = group.students.map(student => student.id);
      // Create class in the database for each group
      await prismadb.classes.create({
        data: {
          seasonId: params.seasonId,
          meetColor: group.meetColor,
          Age: group.age,
          meetingPoint: group.meetingPoint,
          discipline: group.discipline!,
          Level: group.level,
          numberStudents: group.numberStudents,
          // You would have a relation set up in your Prisma schema for this
          students: {
            connect: studentIds.map(id => ({ id })),
          },
        },
      });
    }

    // If all classes are created successfully, send a success response
    return NextResponse.json({ message: "Classes created successfully" });

  } catch (error) {
    // Log the error and return a server error response
    console.error("[POST Error]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}


