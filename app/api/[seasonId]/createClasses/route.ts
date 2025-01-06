import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import {
  mondayPrograms,
  tuesdayPrograms,
  thursdayPrograms,
  fridayNightPrograms,
  saturdayPrograms,
  sundayPrograms,
} from '../../../(dashboard)/[seasonId]/(routes)/students/[studentId]/components/programDropdown';
import { differenceInYears } from 'date-fns';

// Helper to determine level group
function determineLevelGroup(level: number) {
  if (level <= 2) return '1-2';
  if (level <= 4) return '3-4';
  if (level <= 6) return '5-6';
  return '7+';
}

// Helper to determine discipline from program code
function determineDiscipline(programCode: string) {
  if (programCode.includes('-S-')) return 'SKI';
  if (programCode.includes('-B-')) return 'BOARD';
  return null;
}

// Helper to get program details
function getProgramDetails(programCode: string) {
  const allPrograms = [
    ...mondayPrograms,
    ...tuesdayPrograms,
    ...thursdayPrograms,
    ...fridayNightPrograms,
    ...saturdayPrograms,
    ...sundayPrograms,
  ];
  return allPrograms.find((program) => program.code === programCode);
}

// Age groups for grouping students
const ageGroups = [
  { min: 5, max: 5 },
  { min: 6, max: 7 },
  { min: 8, max: 10 },
  { min: 11, max: 14 },
  { min: 15, max: 17 },
  { min: 18, max: Infinity },
];

// Find age group for a given age
function findAgeGroup(age: number) {
  return ageGroups.find((group) => age >= group.min && age <= group.max);
}

// Special programs with smaller class sizes
const specialMaxSizePrograms = new Set(['G115-S-LO', 'G725-S-LO', 'G125-S-LO', 'G715-S-LO']);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { seasonId } = body;

    if (!seasonId) {
      return new NextResponse('Season ID is required', { status: 400 });
    }

    const validStudents = await prismadb.student.findMany({
      where: {
        seasonId,
        status: 'Registered',
      },
    });

    const unsortedStudents = [];

    for (const student of validStudents) {
      const { UniqueID, BRTHD, LEVEL, ProgCode } = student;

      if (ProgCode.endsWith('-TR')) {
        unsortedStudents.push({ UniqueID, error: 'Transportation program students are not sorted' });
        continue;
      }

      const discipline = determineDiscipline(ProgCode);
      if (!discipline) {
        unsortedStudents.push({ UniqueID, error: 'Discipline missing' });
        continue;
      }

      const programDetails = getProgramDetails(ProgCode);
      if (!programDetails) {
        unsortedStudents.push({ UniqueID, error: 'Program details not found' });
        continue;
      }

      const birthDate = new Date(BRTHD);
      const age = differenceInYears(new Date('2025-01-01'), birthDate);
      const ageGroup = findAgeGroup(age);

      if (!ageGroup) {
        unsortedStudents.push({ UniqueID, error: 'Age group not found' });
        continue;
      }

      const levelGroup = determineLevelGroup(parseInt(LEVEL, 10));

      await prismadb.$transaction(async (tx) => {
        const isFriday = programDetails.day === 'Friday';
        const isSpecialProgram = specialMaxSizePrograms.has(ProgCode);

        const queryConditions = {
          Level: levelGroup,
          discipline,
          seasonId,
          progCode: isFriday ? undefined : ProgCode,
          day: programDetails.day,
          startTime: programDetails.startTime,
          endTime: programDetails.endTime,
          Age: !isFriday && !isSpecialProgram
            ? {
                gte: ageGroup.min,
                ...(ageGroup.max !== Infinity && { lte: ageGroup.max }), // Handle Infinity correctly
              }
            : undefined,
          numberStudents: { lt: isSpecialProgram ? 3 : isFriday ? 10 : 8 },
        };

        let suitableClass = await tx.classes.findFirst({
          where: queryConditions,
          orderBy: [
            { numberStudents: 'desc' },
            { Age: 'asc' }, // Prioritize closer age matches
          ],
        });

        if (!suitableClass) {
          suitableClass = await tx.classes.create({
            data: {
              Level: levelGroup,
              Age: queryConditions.Age ? age : undefined,
              discipline,
              numberStudents: 1,
              seasonId,
              progCode: ProgCode,
              day: programDetails.day,
              startTime: programDetails.startTime,
              endTime: programDetails.endTime,
            },
          });
        } else {
          await tx.classes.update({
            where: { classId: suitableClass.classId },
            data: { numberStudents: { increment: 1 } },
          });
        }

        await tx.student.update({
          where: { UniqueID },
          data: { classId: suitableClass.classId },
        });
      });
    }

    return NextResponse.json({ message: 'Classes created successfully', unsortedStudents });
  } catch (error) {
    console.error('[createClasses_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
