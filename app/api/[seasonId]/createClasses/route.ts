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
  'EAST-B-LT', 'LINC-S-LT', 'WHIT-S-LT', 'JANE-B-LT', 'NATH-S-LT',
  'NATH-B-LT', 'ROOS-B-LT' ,'LINC-B-LT',
];



const saturdayMorningCodes = [
  'G710-S-LO','G710-B-LO','G715-S-LO'
];
const saturdayAfternoonCodes = [
  'G720-S-LO','G720-B-LO','G725-S-LO'
];

const sundayMorningCodes = [
  'G110-S-LO','G110-B-LO','G115-S-LO'
];
const sundayAfternoonCodes = [
  'G120-B-LO','G120-S-LO','G125-S-LO'
];
const magicKingdomProgCodes = ['G725-S-LO', 'G715-S-LO', 'G125-S-LO', 'G115-S-LO'];


function chunkArray<T>(array: T[], size: number): T[][] {
  return array.reduce((chunks, item, index) => {
    const chunkIndex = Math.floor(index / size);
    chunks[chunkIndex] = ([] as T[]).concat(chunks[chunkIndex] || [], item);
    return chunks;
  }, [] as T[][]);
}

function filterByAge(students: Student[], minAge: number, maxAge: number): Student[] {
  return students.filter(student => student.AGE !== null && student.AGE >= minAge && (maxAge === Infinity ? true : student.AGE <= maxAge));
}
// function createClasses(students: Student[]): StudentGroup[] {
//   const groups: StudentGroup[] = [];

//   // Special handling for age 5
//   const age5Students = filterByAge(students, 5, 5);
//   const age5Classes = chunkArray(age5Students, 3); // Classes of size 3 for age 5
//   age5Classes.forEach(classGroup => groups.push(createStudentGroup(classGroup)));

//   // Handle any leftover age 5 students
//   const leftoverAge5 = age5Students.length % 3;
//   if (leftoverAge5 > 0) {
//     const leftoverStudents = age5Students.slice(-leftoverAge5);
//     groups.push(createStudentGroup(leftoverStudents));
//   }
//   // Handling for other age groups
//   const ageGroups = [
//     { min: 6, max: 7 },
//     { min: 8, max: 10 },
//     { min: 11, max: 14 },
//     { min: 15, max: 17 },
//     { min: 18, max:Infinity}
//   ];

//   ageGroups.forEach(({ min, max }) => {
//     const ageGroupStudents = filterByAge(students, min, max);
//     const levelGroups = groupByMultipleCriteria(ageGroupStudents, ['LEVEL']);

//     levelGroups.forEach(levelGroup => {
//       // Determine chunk size based on level
//       const isLowerLevel = levelGroup.some(student => student.LEVEL === "1/2" || student.LEVEL === "3/4");
//       const chunkSize = isLowerLevel ? 5 : 8;

//       const classes = chunkArray(levelGroup, chunkSize);
//       classes.forEach(classGroup => groups.push(createStudentGroup(classGroup)));
//     });
//   });

//   return groups;
// }
// Utility function to combine small groups

function combineSmallGroups(groups: Student[][], classSize: number): Student[][] {
  let combinedGroups: Student[][] = [];
  let leftovers: Student[] = [];

  groups.forEach((group: Student[]) => {
    if (group.length < classSize) {
      leftovers = [...leftovers, ...group];
    } else {
      combinedGroups.push(group);
    }
  });

  // Further combine leftovers if possible
  while (leftovers.length > 0) {
    if (leftovers.length <= classSize) {
      combinedGroups.push(leftovers);
      break;
    } else {
      combinedGroups.push(leftovers.slice(0, classSize));
      leftovers = leftovers.slice(classSize);
    }
  }

  return combinedGroups;
}

function createClasses(students: Student[]): StudentGroup[] {
  const groups: StudentGroup[] = [];
  const magicKingdomClassSize = 3; // Class size for Magic Kingdom classes
  const fridayClassSize = 8; // Class size for Friday classes
  const otherClassSize = 8; // Default class size for other classes

  const ageGroups = [
    { min: 6, max: 7 },
    { min: 8, max: 10 },
    { min: 11, max: 14 },
    { min: 15, max: 17 },
    { min: 18, max: Infinity },
  ];

  const groupedByProgCode = groupBy(students, 'ProgCode');

  Object.entries(groupedByProgCode).forEach(([progCode, progCodeGroup]) => {
    resetMeetingPoint(determineTimeSlot(progCode));

    if (magicKingdomProgCodes.includes(progCode)) {
      let classGroups = chunkArray(progCodeGroup, magicKingdomClassSize);
      classGroups.forEach(classGroup => {
        groups.push(createStudentGroup({ students: classGroup, progCode }));
      });
    } else if (fridayProgCodes.includes(progCode)) {
      // Skip handling Friday classes here, will handle them separately after this loop
    } else {
      let allClassesForProgCode: Student[][] = [];
      ageGroups.forEach(({ min, max }) => {
        const ageGroupStudents = filterByAge(progCodeGroup, min, max);
        const groupedByLevel = groupBy(ageGroupStudents, 'LEVEL');
        Object.entries(groupedByLevel).forEach(([level, levelGroup]) => {
          let classSize = determineClassSizeBasedOnCriteria(level);
          let classes = chunkArray(levelGroup, classSize);
          allClassesForProgCode = allClassesForProgCode.concat(classes);
        });
      });

      let combinedClasses = combineSmallGroups(allClassesForProgCode, otherClassSize);
      combinedClasses.forEach(classGroup => {
        groups.push(createStudentGroup({ students: classGroup, progCode }));
      });
    }
  });

  // Handling Friday classes
  const fridayStudents = students.filter(student => fridayProgCodes.includes(student.ProgCode!));
  const groupedByDisciplineLevel = groupByMultipleCriteria(fridayStudents, ['APPLYING_FOR', 'LEVEL']) as Student[][];
  groupedByDisciplineLevel.forEach(disciplineLevelGroup => {
    let classGroups = chunkArray(disciplineLevelGroup.flat(), fridayClassSize);
    classGroups = combineSmallGroups(classGroups, fridayClassSize);
    classGroups.forEach(classGroup => {
      const commonProgCode = mostCommonValue(classGroup, 'ProgCode') || "";
      groups.push(createStudentGroup({ students: classGroup, progCode: commonProgCode }));
    });
  });

  return groups;
}

// Additional utility functions and types remain the same as in your original implementation.

function groupByMultipleCriteria<T>(array: T[], criteria: (keyof T)[]): T[][] {
  const group = array.reduce((acc, item) => {
    const key = criteria.map(criterion => String(item[criterion])).join("-");
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);

  return Object.values(group);
}


function determineClassSizeBasedOnCriteria(level: string): number {
  // For lower levels "1/2" and "3/4", class size is 5
  if (level.includes( "1/2 novice") || level.includes("3/4 inter")) {
    return 5;
  }
  // For all other levels, class size is 8
  return 8;
}


// function createClasses(students: Student[]): StudentGroup[] {
//   const groups: StudentGroup[] = [];
//   const classSize = 3; // Class size for Magic Kingdom classes

//   // Group students by ProgCode
//   const groupedByProgCode = groupBy(students, 'ProgCode');

//   // Process each ProgCode group
//   groupedByProgCode.forEach(progCodeGroup => {
//     // Check if the progCode group belongs to Magic Kingdom
//     if (progCodeGroup.some(student => magicKingdomProgCodes.includes(student.ProgCode))) {
//       // Chunk students into classes of 3
//       const classGroups = chunkArray(progCodeGroup, classSize);

//       // Create StudentGroup for each class
//       classGroups.forEach(classGroup => {
//         const newGroup = createStudentGroup(classGroup);
//         groups.push(newGroup);
//       });
//     }
//   });

//   return groups;
// }
function determineTimeSlot(progCode: string | null): keyof MeetingPointsType {
  if (!progCode) {
    throw new Error("progCode is null or undefined.");
  }
  if (fridayProgCodes.includes(progCode || "")) {
    return "Friday";
  }
  if (saturdayMorningCodes.includes(progCode || "")) {
    return "Saturday Morning";
  }
  if (saturdayAfternoonCodes.includes(progCode || "")) {
    return "Saturday Afternoon";
  }
  if (sundayMorningCodes.includes(progCode || "")) {
    return "Sunday Morning";
  }
  if (sundayAfternoonCodes.includes(progCode || "")) {
    return "Sunday Afternoon";
  }

  throw new Error(`No valid time slot found for progCode: ${progCode}`);
}

function createStudentGroup({ students, progCode }: { students: Student[], progCode: string }): StudentGroup {
  const commonApplyingFor = mostCommonValue(students, 'APPLYING_FOR') || "";
  const commonLevel = mostCommonValue(students, 'LEVEL') || "";
  const commonProgCode = mostCommonValue(students, 'ProgCode') || "";

  const youngestAge = students.reduce((minAge, student) => student.AGE !== null && student.AGE < minAge ? student.AGE : minAge, Infinity);

  const daySlot = determineTimeSlot(progCode);
  const discipline = (commonApplyingFor === "SKI" ? "Ski" : "Board") as keyof DisciplineMeetingPoints;

  const meetColor = determineMeetColor(commonApplyingFor); // Use the function to determine the meet color
  const meetingPointDetails = determineMeetingPoint(daySlot, discipline, commonLevel,progCode);

  return {
    progCode: commonProgCode,
    day: daySlot,
    applyingFor: commonApplyingFor,
    age: youngestAge,
    level: commonLevel,
    discipline, // Shorthand notation used here
    numberStudents: students.length,
    meetColor: meetColor, // Set the color based on the discipline
    meetingPoint: meetingPointDetails.point,
    students
  };
}

// Utility function to find the most common value for a property in an array of objects
function mostCommonValue<T extends { [key: string]: any }>(array: T[], key: keyof T): string | null {
  const frequency: Record<string, number> = {};

  array.forEach((item) => {
    const value = item[key];
    const valueAsString = typeof value === 'number' ? value.toString() : value;
    frequency[valueAsString] = (frequency[valueAsString] || 0) + 1;
  });

  let maxFrequency = 0;
  let mostCommonValue: string | null = null;

  Object.keys(frequency).forEach((key) => {
    const count = frequency[key];
    if (count > maxFrequency) {
      maxFrequency = count;
      mostCommonValue = key; // key is already a string
    }
  });

  return mostCommonValue;
}


//Helper function to group by multiple criteria
// function groupByMultipleCriteria(students: Student[], criteria: (keyof Student)[]): Student[][] {
//   // Start with the original list and progressively group by each criterion
//   return criteria.reduce((grouped: Student[][], criterion: keyof Student) => {
//     return grouped.flatMap(group => groupBy(group, criterion));
//   }, [students]);
// }

// // Utility function to group an array of objects by a property
function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    groups[groupKey] = groups[groupKey] || [];
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

type DisciplineMeetingPoints = {
  Ski: number;
  Board: number;
};

type MeetingPointsType = {
  "Friday": DisciplineMeetingPoints;
  "Saturday Morning": DisciplineMeetingPoints;
  "Saturday Afternoon": DisciplineMeetingPoints;
  "Sunday Morning": DisciplineMeetingPoints;
  "Sunday Afternoon": DisciplineMeetingPoints;
  // Add other specific days or time slots as needed
};

let meetingPoints: MeetingPointsType = {
  "Friday": { Ski: 1, Board: 1 },
  "Saturday Morning": { Ski: 1, Board: 1 },
  "Saturday Afternoon": { Ski: 1, Board: 1 },
  "Sunday Morning": { Ski: 1, Board: 1 },
  "Sunday Afternoon": { Ski: 1, Board: 1 },
} as MeetingPointsType;

function determineMeetColor(applyingFor: string): string {
  return applyingFor === "SKI" ? "Red" : "Blue";
}

const maxMeetingPoint = 50; // Maximum value for a meeting point

// Function to reset meeting points for a day/time slot
function resetMeetingPoint(daySlot: keyof MeetingPointsType) {
  meetingPoints[daySlot].Ski = 1;
  meetingPoints[daySlot].Board = 1;
}

// Function to determine the next available meeting point
function determineMeetingPoint(daySlot: keyof MeetingPointsType, discipline: 'Ski' | 'Board', level: string, progCode: string): { point: number, color: string } {
  let disciplineKey: keyof DisciplineMeetingPoints = discipline === "Ski" ? 'Ski' : 'Board';
  let currentPoint = meetingPoints[daySlot][disciplineKey];

  // Handling for Magic Kingdom classes
  if (magicKingdomProgCodes.includes(progCode)) {
    if (currentPoint > 3) { // Reset to 1 if it exceeds 3
      currentPoint = 1;
    } else {
      currentPoint = (currentPoint < 3) ? currentPoint + 1 : 1;
    }
  } else {
    // General handling for other classes
    let levelRanges: { [key: string]: { start: number; end: number } } = {
      "1/2 novice": { start: 1, end: 15 },
      "3/4 inter": { start: 16, end: 29 },
      "5/6 adv inter": { start: 30, end: 40 },
      "7/8 advance": { start: 41, end: 50 },
      "9 atac": { start: 41, end: 50 },
    };

    let range = levelRanges[level as keyof typeof levelRanges];
    if (!range) {
      throw new Error(`Invalid level: ${level}`);
    }

    let { start, end } = range;

    // If currentPoint is outside the level's range, reset to start of the range
    if (currentPoint < start || currentPoint > end) {
      currentPoint = start;
    }

    // Check if the currentPoint has reached the end of the range
    if (currentPoint === end) {
      currentPoint = start; // Reset point to start of the range
    } else {
      currentPoint++; // Increment the meeting point for the next group
    }
  }

  meetingPoints[daySlot][disciplineKey] = currentPoint; // Update the current point
  let meetColor = "Red"; // Default color, adjust as needed

  return { point: currentPoint, color: meetColor };
}
// let currentLowerMeetingPoint = 1; // Start from 1 for "1/2 novice" and "3/4 inter"
// let currentUpperMeetingPoint = 30; // Start from 30 for other levels

// function determineMeetingPoint(level: string | null): number {
//   // Check if level is "1/2 novice" or "3/4 inter"
//   if (level === "1/2 novice" || level === "3/4 inter") {
//     if (currentLowerMeetingPoint > 29) {
//       currentLowerMeetingPoint = 1; // Reset if it exceeds the range
//     }
//     return currentLowerMeetingPoint++; // Increment and return the meeting point
//   } else {
//     // For levels other than "1/2 novice" or "3/4 inter"
//     if (currentUpperMeetingPoint > 50) {
//       currentUpperMeetingPoint = 30; // Reset if it exceeds the range
//     }
//     return currentUpperMeetingPoint++; // Increment and return the meeting point
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

async function processStudentGroups(groups: (StudentGroup | undefined)[], prisma: PrismaClient, seasonId: string) {
  // Filter out undefined groups
  const validGroups = groups.filter(group => group !== undefined) as StudentGroup[];

  for (const group of validGroups) {
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

    // Update students in separate transactions
    for (const student of group.students) {
      await prismadb.student.update({
        where: { id: student.id },
        data: { classID: classId, meetingPoint: group.meetingPoint },
      });
    }
  }
}
