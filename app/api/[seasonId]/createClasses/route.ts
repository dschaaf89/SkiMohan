import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { PrismaClient } from "@prisma/client";




interface Student {
  id: string;
  DAY: string | null; // Adjusted to allow null
  APPLYING_FOR: string | null; // Adjusted to allow null
  AGE: number | null; // Adjusted to allow null
  LEVEL: string | null; // Adjusted to allow null
  ProgCode: string | null; // Adjusted to allow null
}

interface StudentGroup {
  progCode: string |null;
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

function filterByAge(students: Student[], minAge: number, maxAge: number): Student[] {
  return students.filter(student => student.AGE !== null && student.AGE >= minAge && student.AGE <= maxAge);
}
function createClasses(students: Student[]): StudentGroup[] {
  const groups: StudentGroup[] = [];

  // Special handling for age 5
  const age5Students = filterByAge(students, 5, 5);
  const age5Classes = chunkArray(age5Students, 3); // Classes of size 3 for age 5
  age5Classes.forEach(classGroup => groups.push(createStudentGroup(classGroup)));

  // Handling for other age groups
  const ageGroups = [
    { min: 6, max: 7 },
    { min: 8, max: 10 },
    { min: 11, max: 14 },
    { min: 15, max: 17 },
    // Add more age groups as needed
  ];

  ageGroups.forEach(({ min, max }) => {
    const ageGroupStudents = filterByAge(students, min, max);
    const levelGroups = groupByMultipleCriteria(ageGroupStudents, ['LEVEL']);

    levelGroups.forEach(levelGroup => {
      const classes = chunkArray(levelGroup, 5); // Classes of size 5 for other age groups
      classes.forEach(classGroup => groups.push(createStudentGroup(classGroup)));
    });
  });

  // Add additional logic for students 18+ if necessary
  
  // Handling for age 18 and older
  const adultStudents = filterByAge(students, 18, Infinity); // Include all students 18 and older
  const adultClasses = chunkArray(adultStudents, 5); // Adjust the class size as needed for adults
  adultClasses.forEach(classGroup => groups.push(createStudentGroup(classGroup)));

  return groups;
}


function createStudentGroup(students: Student[]): StudentGroup {
  const commonDay = mostCommonValue(students, 'DAY');
  const commonApplyingFor = mostCommonValue(students, 'APPLYING_FOR');
  const commonLevel = mostCommonValue(students, 'LEVEL');
  const commonProgCode = mostCommonValue(students, 'ProgCode');
  const meetColor = determineMeetColor(typeof commonApplyingFor === 'string' ? commonApplyingFor : null);
  const meetingPoint = determineMeetingPoint(typeof commonLevel === 'string' ? commonLevel : null);

  return {
    progCode: typeof commonProgCode === 'string' ? commonProgCode : null,
    day: typeof commonDay === 'string' ? commonDay : null,
    applyingFor: typeof commonApplyingFor === 'string' ? commonApplyingFor : null,
    age: students[0]?.AGE || null,
    level: typeof commonLevel === 'string' ? commonLevel : null,
    discipline: typeof commonApplyingFor === 'string' ? commonApplyingFor : null,
    numberStudents: students.length,
    meetColor: meetColor,
    meetingPoint: meetingPoint,
    students: students,
  };
}


// Utility function to find the most common value for a property in an array of objects
function mostCommonValue<T extends { [key: string]: any }>(array: T[], key: keyof T): T[keyof T] | null {
  const frequency: Record<string, number> = {};

  array.forEach((item) => {
    const valueAsString = String(item[key]);
    frequency[valueAsString] = (frequency[valueAsString] || 0) + 1;
  });

  let maxFrequency = 0;
  let mostCommonValue: T[keyof T] | null = null;

  Object.keys(frequency).forEach((key) => {
    const value = key as unknown as T[keyof T];
    const count = frequency[key];
    if (count > maxFrequency) {
      maxFrequency = count;
      mostCommonValue = value;
    }
  });

  return mostCommonValue;
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
// function groupForFriday(students: Student[]): StudentGroup[] {
//   const groups: StudentGroup[] = [];

//   // Group students by discipline for Friday classes
//   const groupedByDiscipline = groupBy(students.filter(student => student.APPLYING_FOR !== 'Transportation'), 'APPLYING_FOR');

//   // Iterate through the groups and create StudentGroup objects
//   for (const disciplineGroup of Object.values(groupedByDiscipline)) {
//     const levelGroups = chunkArray(disciplineGroup, 5);
//     groups.push(...levelGroups.map(createStudentGroup));
//   }

//   return groups;
// }

// // Function to group students by program code for Magic Kingdom classes
// function groupForMagicKingdom(students: Student[], codes: string[]): StudentGroup[] {
//   const groups: StudentGroup[] = [];

//   codes.forEach(progCode => {
//     const studentsInProgram = students.filter(student => student.ProgCode === progCode);
//     const programGroups = chunkArray(studentsInProgram, 3);
//     groups.push(...programGroups.map(createStudentGroup));
//   });

//   return groups;
// }


// // Function to group students by program code for regular Saturday and Sunday classes
// function groupForRegularWeekend(students: Student[], codes: string[]): StudentGroup[] {
//   const groups: StudentGroup[] = [];

//   codes.forEach(progCode => {
//     const studentsInProgram = students.filter(student => student.ProgCode === progCode);

//     // Split students into two groups: aged 18 and older and under 18
//     const olderThan18 = studentsInProgram.filter(student => student.AGE !== null && student.AGE >= 18);
//     const under18 = studentsInProgram.filter(student => student.AGE !== null && student.AGE < 18);

//     if (olderThan18.length > 0) {
//       // Group students aged 18 and older by level
//       const groupedByLevel18Plus = groupBy(olderThan18, 'LEVEL');
      
//       for (const levelGroup of groupedByLevel18Plus) {
//         const ageAndLevelGroup18Plus = chunkArray(levelGroup, 5);
//         groups.push(...ageAndLevelGroup18Plus.map(createStudentGroup));
//       }
//     }

//     if (under18.length > 0) {
//       // Group students under 18 by level
//       const groupedByLevelUnder18 = groupBy(under18, 'LEVEL');

//       for (const levelGroup of groupedByLevelUnder18) {
//         const ageAndLevelGroupUnder18 = chunkArray(levelGroup, 5);
//         groups.push(...ageAndLevelGroupUnder18.map(createStudentGroup));
//       }
//     }
//   });

//   return groups;
// }


//Helper function to group by multiple criteria
function groupByMultipleCriteria(students: Student[], criteria: (keyof Student)[]): Student[][] {
  // Start with the original list and progressively group by each criterion
  return criteria.reduce((grouped: Student[][], criterion: keyof Student) => {
    return grouped.flatMap(group => groupBy(group, criterion));
  }, [students]);
}

// // Utility function to group an array of objects by a property
function groupBy<T>(array: T[], key: keyof T): T[][] {
  const groups: Record<string, T[]> = {};
  array.forEach((item) => {
    const groupKey = String(item[key]);
    groups[groupKey] = groups[groupKey] || [];
    groups[groupKey].push(item);
  });
  return Object.values(groups);
}

// function createStudentGroup(students: Student[]): StudentGroup {
//   // Implement logic to create a StudentGroup from an array of Students
//   // Example implementation:
//   const groupAge = students[0].AGE ?? 0;
//   const meetColor = determineMeetColor(students[0]);
//   const meetingPoint = determineMeetingPoint(students[0]);
//   const day = students[0].DAY;

//   return {
//     day: students[0].DAY ?? 'Unknown',
//     applyingFor: students[0].APPLYING_FOR ?? 'Unknown',
//     age: groupAge,
//     level: students[0].LEVEL ?? 'Unknown',
//     discipline: students[0].APPLYING_FOR ?? 'Unknown',
//     numberStudents: students.length,
//     meetColor,
//     meetingPoint,
//     students,
//   };
// }


// function createGroupsFromStudents(studentBatches: Student[][]): StudentGroup[] {
//   const flattenedStudents = studentBatches.flat();
//   return [createStudentGroup(flattenedStudents)];
// }
function determineMeetColor(applyingFor: string | null): string {
  if (applyingFor === "SKI") {
    return "Red";
  } else {
    return "Blue"; // or some default color if 'applyingFor' is null
  }
}

let currentLowerMeetingPoint = 1; // Start from 1 for "1/2 novice" and "3/4 inter"
let currentUpperMeetingPoint = 30; // Start from 30 for other levels

function determineMeetingPoint(level: string | null): number {
  // Check if level is "1/2 novice" or "3/4 inter"
  if (level === "1/2 novice" || level === "3/4 inter") {
    if (currentLowerMeetingPoint > 29) {
      currentLowerMeetingPoint = 1; // Reset if it exceeds the range
    }
    return currentLowerMeetingPoint++; // Increment and return the meeting point
  } else {
    // For levels other than "1/2 novice" or "3/4 inter"
    if (currentUpperMeetingPoint > 50) {
      currentUpperMeetingPoint = 30; // Reset if it exceeds the range
    }
    return currentUpperMeetingPoint++; // Increment and return the meeting point
  }
}

// export async function POST(
//   req: Request,
//   { params }: { params: { seasonId: string } }
// ) {
//   try {
//     // Fetch all students
//     const allStudents = await prismadb.student.findMany();
//     const filteredStudents = allStudents.filter(student => student.APPLYING_FOR !== "Transportation");
//     // Use the new createClasses function to group students and create classes
//     const studentGroups = createClasses(filteredStudents);

//     // Iterate over the student groups and create classes in the database
//     for (const group of studentGroups) {
//       // Extract student IDs for the class creation
//       const studentIds = group.students.map(student => student.id);

//       // Create class in the database for the group
//       await prismadb.classes.create({
//         data: {
//           seasonId: params.seasonId,
//           meetColor: group.meetColor,
//           Age: group.age,
//           meetingPoint: group.meetingPoint,
//           discipline: group.discipline!,
//           Level: group.level,
//           progCode: group.progCode!,
//           day: group.day!, // Assign the day of the class
//           numberStudents: group.numberStudents,
//           // You would have a relation set up in your Prisma schema for this
//           students: {
//             connect: studentIds.map(id => ({ id })),
//           },
//         },
//       });
//     }

//     // If all classes are created successfully, send a success response
//     return NextResponse.json({ message: "Classes created successfully" });
//   } catch (error) {
//     // Log the error and return a server error response
//     console.error("[POST Error]", error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }

export async function POST(
  req: Request,
  { params }: { params: { seasonId: string } }
) {
  try {
    const allStudents = await prismadb.student.findMany();
    
    const allBoarders = allStudents.filter(student => student.APPLYING_FOR === "BOARD");
    const allSkiers = allStudents.filter(student => student.APPLYING_FOR === "SKI");

    console.log("Number of boarder students:", allBoarders.length);
    console.log("Number of ski students:", allSkiers.length);

    const boarderGroups = createClasses(allBoarders);
    const skierGroups = createClasses(allSkiers);

    console.log("Number of boarder groups:", boarderGroups.length);
    console.log("Number of ski groups:", skierGroups.length);

    // Process boarder groups
    await processStudentGroups(boarderGroups, prismadb, params.seasonId);

    // Process skier groups
    await processStudentGroups(skierGroups, prismadb, params.seasonId);

    return NextResponse.json({ message: "Classes created and students updated successfully" });
  } catch (error) {
    console.error("[POST Error]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

async function processStudentGroups(
  groups: StudentGroup[], 
  prisma: PrismaClient, 
  seasonId: string
) {
  for (const group of groups) {
    // Start a transaction
    await prismadb.$transaction(async (prismadb) => {
      // Create class in the database for the group
      const createdClass = await prismadb.classes.create({
        data: {
          seasonId: seasonId,
          meetColor: group.meetColor,
          Age: group.age,
          meetingPoint: group.meetingPoint,
          discipline: group.discipline!,
          Level: group.level,
          day: group.day!, 
          progCode: group.progCode!,
          numberStudents: group.numberStudents,
          students: {
            connect: group.students.map(student => ({ id: student.id })),
          },
        },
      });

      // Extract classId from created class
      const classId = createdClass.classId;

      // Update each student in the group with the new classId
      for (const student of group.students) {
        await prisma.student.update({
          where: { id: student.id },
          data: { classID: classId },
        });
      }
    });
  }
}
// export async function POST(
//   req: Request,
//   { params }: { params: { seasonId: string } }
// ) {
//   try {
//     // Fetch all students
//    // Fetch all students
// const allStudents = await prismadb.student.findMany();
// const assignedStudents = new Set();

// // Group students by discipline for Friday classes
// const fridayGroups: StudentGroup[] = groupForFriday(allStudents);
// const saturdayMKGroups = groupForMagicKingdom(allStudents, saturdayMagicKindomCodes);
// const sundayMKGroups = groupForMagicKingdom(allStudents, sundayMagicKindomCodes);
// const saturdayRegularGroups = groupForRegularWeekend(allStudents, saturdayCodes);
// const sundayRegularGroups = groupForRegularWeekend(allStudents, sundayCodes);

// const combinedGroups = [...fridayGroups, ...saturdayMKGroups, ...sundayMKGroups, ...saturdayRegularGroups, ...sundayRegularGroups];

// // Iterate over the student groups and create classes in the database
// for (const group of combinedGroups) {
//   // Filter unassigned students from the group
//   const unassignedStudents = group.students.filter(student => !assignedStudents.has(student.id));
  
//   // If there are unassigned students in the group, create a class for them
//   if (unassignedStudents.length > 0) {
//     // Extract student IDs for the class creation
//     const studentIds = unassignedStudents.map(student => student.id);

//     // Create class in the database for the unassigned students
//     await prismadb.classes.create({
//       data: {
//         seasonId: params.seasonId,
//         meetColor: group.meetColor,
//         Age: group.age,
//         meetingPoint: group.meetingPoint,
//         discipline: group.discipline!,
//         Level: group.level,
//         day: group.day!, // Assign the day of the class
//         numberStudents: group.numberStudents,
//         // You would have a relation set up in your Prisma schema for this
//         students: {
//           connect: studentIds.map(id => ({ id })),
//         },
//       },
//     });

//     // Add the IDs of the assigned students to the set
//     studentIds.forEach(id => assignedStudents.add(id));
//   }
// }

// // Check if there are any unassigned students
// const unassignedStudents = allStudents.filter(student => !assignedStudents.has(student.id));

// if (unassignedStudents.length > 0) {
//   // Handle the case where there are unassigned students (excluding Transportation Only students)
//   // You can log an error or take appropriate action here.
// }


//     // If all classes are created successfully, send a success response
//     return NextResponse.json({ message: "Classes created successfully" });
//   } catch (error) {
//     // Log the error and return a server error response
//     console.error("[POST Error]", error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }