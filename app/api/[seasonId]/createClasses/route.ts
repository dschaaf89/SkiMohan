import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { mondayPrograms, tuesdayPrograms, thursdayPrograms, fridayNightPrograms, saturdayPrograms, sundayPrograms } from '../../../(dashboard)/[seasonId]/(routes)/students/[studentId]/components/programDropdown';
import { differenceInYears } from 'date-fns';
let skiMeetingCounter = { 1: 1, 2: 8, 3: 15, 4: 22, 5: 29, 6: 36, 7: 43 };
let boardMeetingCounter = { 1: 1, 2: 8, 3: 15, 4: 22, 5: 29, 6: 36, 7: 43 };
const skiColors = ["red", "yellow"];
let skiColorIndex = 0;

const ageGroups = [
  { min: 5, max: 5 },    // 5-year-olds only group
  { min: 6, max: 7 },
  { min: 8, max: 10 },
  { min: 11, max: 14 },
  { min: 15, max: 17 },
  { min: 18, max: Infinity },
];

const findAgeGroup = (age: number) => ageGroups.find(group => age >= group.min && (group.max === Infinity || age <= group.max));

function getMeetingPoint(discipline: string, level: string) {
  let meetingPoint, color;
  const numericLevel = parseInt(level, 10);

  if (discipline === "SKI") {
    color = skiColors[skiColorIndex];
    meetingPoint = skiMeetingCounter[numericLevel]++;
    if (meetingPoint > 7 + (numericLevel - 1) * 7) {
      skiColorIndex = (skiColorIndex + 1) % skiColors.length;
      skiMeetingCounter[numericLevel] = (numericLevel - 1) * 7 + 1;
      color = skiColors[skiColorIndex];
      meetingPoint = skiMeetingCounter[numericLevel]++;
    }
  } else if (discipline === "BOARD") {
    color = "blue";
    meetingPoint = boardMeetingCounter[numericLevel]++;
  }
  return { color, meetingPoint };
}

function determineDiscipline(programCode: string) {
  if (programCode.includes('-S-')) return 'SKI';
  else if (programCode.includes('-B-')) return 'BOARD';
  else if (programCode.includes('-T-')) return 'TRANSPORTATION';
  return null;
}

function determineAppType(programCode: string) {
  const appTypeCode = programCode.split('-').pop();
  return appTypeCode === 'LO' ? 1 : appTypeCode === 'TR' ? 2 : appTypeCode === 'LT' ? 3 : null;
}

function getProgramDetails(programCode: string) {
  const allPrograms = [...mondayPrograms, ...tuesdayPrograms, ...thursdayPrograms, ...fridayNightPrograms, ...saturdayPrograms, ...sundayPrograms];
  return allPrograms.find(program => program.code === programCode);
}

const specialMaxSizePrograms = new Set(['G115-S-LO', 'G725-S-LO', 'G125-S-LO', 'G715-S-LO']);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { students, seasonId } = body;

    if (!seasonId) return new NextResponse("Season ID is required", { status: 400 });

    const unsortedStudents = [];

    for (const studentData of students) {
      const {
        UniqueID,
        NAME_FIRST,
        NAME_LAST,
        HOME_TEL,
        ADDRESS,
        CITY,
        STATE,
        ZIP,
        Email_student,
        BRTHD,
        GradeLevel,
        LEVEL,
        ProgCode
      } = studentData;

      const discipline = determineDiscipline(ProgCode);
      if (!discipline || discipline === 'TRANSPORTATION') {
        unsortedStudents.push({ UniqueID, error: "Discipline missing or Transportation program" });
        continue;
      }

      const appType = determineAppType(ProgCode);
      const programDetails = getProgramDetails(ProgCode);
      if (!programDetails) {
        unsortedStudents.push({ UniqueID, error: "Program not found" });
        continue;
      }

      const birthDate = new Date(BRTHD);
      if (isNaN(birthDate.getTime())) {
        unsortedStudents.push({ UniqueID, error: "Invalid birthdate" });
        continue;
      }

      const calculatedAge = differenceInYears(new Date("2025-01-01"), birthDate);
      const ageGroup = findAgeGroup(calculatedAge);
      if (!ageGroup) {
        unsortedStudents.push({ UniqueID, error: "Age group not found" });
        continue;
      }

      let { color, meetingPoint } = getMeetingPoint(discipline, LEVEL);

      // Determine sorting criteria based on program day (Friday vs. Saturday-Sunday)
      const isFridayProgram = fridayNightPrograms.some(program => program.code === ProgCode);
      const isWeekendProgram = saturdayPrograms.some(program => program.code === ProgCode) || sundayPrograms.some(program => program.code === ProgCode);

      // Check if the program code is in the special max size set
      const maxSize = specialMaxSizePrograms.has(ProgCode) ? 3 : 7;

      let suitableClass;
      if (isFridayProgram) {
        // Friday: Group by discipline and level only
        suitableClass = await prismadb.classes.findFirst({
          where: {
            Level: LEVEL,
            discipline,
            numberStudents: { lt: maxSize },
            seasonId,
          },
        });
      } else if (isWeekendProgram) {
        // Saturday-Sunday: Group by progCode, ageGroup, and discipline
        suitableClass = await prismadb.classes.findFirst({
          where: {
            Level: LEVEL,
            discipline,
            progCode: ProgCode,
            numberStudents: { lt: maxSize },
            seasonId,
            Age: { gte: ageGroup.min, ...(ageGroup.max !== Infinity && { lte: ageGroup.max }) },
          },
        });
      } else {
        // Default logic for other days
        suitableClass = await prismadb.classes.findFirst({
          where: {
            Level: LEVEL,
            discipline,
            progCode: ProgCode,
            numberStudents: { lt: maxSize },
            seasonId,
            meetColor: color,
            meetingPoint: meetingPoint,
            Age: { gte: ageGroup.min, ...(ageGroup.max !== Infinity && { lte: ageGroup.max }) },
          },
        });
      }

      let classId;
      if (suitableClass) {
        classId = suitableClass.classId;
        await prismadb.classes.update({
          where: { classId: classId },
          data: { numberStudents: { increment: 1 } },
        });
      } else {
        const newClass = await prismadb.classes.create({
          data: {
            seasonId,
            Level: LEVEL,
            Age: calculatedAge,
            discipline,
            numberStudents: 1,
            day: programDetails.day,
            progCode: ProgCode,
            meetColor: color,
            meetingPoint: meetingPoint,
            startTime: programDetails.startTime,
            endTime: programDetails.endTime,
          },
        });
        classId = newClass.classId;
      }

      await prismadb.student.update({
        where: { UniqueID },
        data: { classId },
      });
    }

    if (unsortedStudents.length) {
      console.log("Unsorted Students:", unsortedStudents);
    }

    return NextResponse.json({ message: "Classes created successfully", unsortedStudents });
  } catch (error) {
    console.error('[createClasses_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}