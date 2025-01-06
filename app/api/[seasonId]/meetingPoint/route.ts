import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { differenceInYears } from 'date-fns';

// Meeting point ranges and logic
const meetingPointRanges = {
  SKI: {
    levels: {
      '1-2': { start: 4, end: 20 },
      '3-4': { start: 21, end: 35 },
      '5-6': { start: 36, end: 45 },
      '7+': { start: 46, end: 50 },
    },
    specialPrograms: { start: 1, end: 3 },
  },
  BOARD: {
    levels: {
      '1-2': { start: 1, end: 20 },
      '3-4': { start: 21, end: 35 },
      '5-6': { start: 36, end: 45 },
      '7+': { start: 46, end: 50 },
    },
    specialPrograms: { start: 1, end: 3 },
  },
};

const colors = {
  SKI: ['red', 'yellow'],
  BOARD: ['blue'],
};

const specialMaxSizePrograms = new Set(['G115-S-LO', 'G725-S-LO', 'G125-S-LO', 'G715-S-LO']);
const meetingPointCounter: Record<string, Record<string, Record<string, number>>> = {};

// Helper to reset meeting point counters
function resetMeetingPointCounters(discipline: string, timeslot: string) {
  console.log(`Resetting meeting points for discipline: ${discipline}, timeslot: ${timeslot}`);
  if (!meetingPointRanges[discipline]) return;
  if (!meetingPointCounter[timeslot]) meetingPointCounter[timeslot] = {};

  const { levels, specialPrograms } = meetingPointRanges[discipline];
  meetingPointCounter[timeslot][discipline] = {
    special: specialPrograms?.start,
    '1-2': levels['1-2']?.start,
    '3-4': levels['3-4']?.start,
    '5-6': levels['5-6']?.start,
    '7+': levels['7+']?.start,
  };

  console.log(`Meeting point counters initialized for ${discipline}:`, meetingPointCounter[timeslot][discipline]);
}

// Helper to calculate age
function calculateAge(birthDate: string | Date): number {
  console.log(`Calculating age for birth date: ${birthDate}`);
  const age = differenceInYears(new Date(), new Date(birthDate));
  console.log(`Calculated age: ${age}`);
  return age;
}

// Helper to get the next meeting point
function getNextMeetingPoint(
  discipline: string,
  levelGroup: string,
  isSpecial: boolean,
  timeslot: string
): { color: string; meetingPoint: number } {
  console.log(`Getting next meeting point for discipline: ${discipline}, level group: ${levelGroup}, timeslot: ${timeslot}`);
  const levelKey = isSpecial ? 'special' : levelGroup;
  const range = meetingPointRanges[discipline][isSpecial ? 'specialPrograms' : 'levels'][levelKey];

  if (!range) throw new Error(`Meeting point range undefined for discipline: ${discipline}, level group: ${levelKey}`);

  if (!meetingPointCounter[timeslot] || !meetingPointCounter[timeslot][discipline]) {
    resetMeetingPointCounters(discipline, timeslot);
  }

  const currentColor = colors[discipline][0];
  let meetingPoint = meetingPointCounter[timeslot][discipline][levelKey];

  console.log(`Current meeting point: ${meetingPoint}, range: ${range.start}-${range.end}, color: ${currentColor}`);

  if (meetingPoint > range.end) {
    if (discipline === 'SKI' && currentColor === 'red') {
      console.log(`Switching to yellow for level group: ${levelKey}`);
      meetingPointCounter[timeslot][discipline][levelKey] = range.start;
      colors.SKI.reverse();
    } else {
      throw new Error(`Meeting points exhausted for level group: ${levelKey}`);
    }
  }

  const assignedMeetingPoint = meetingPointCounter[timeslot][discipline][levelKey];
  meetingPointCounter[timeslot][discipline][levelKey]++;
  console.log(`Assigned meeting point: ${assignedMeetingPoint}, color: ${currentColor}`);
  return { color: currentColor, meetingPoint: assignedMeetingPoint };
}

// POST Route
export async function POST(req: Request) {
  const skippedClasses: Array<{ classId: string; error: string }> = [];

  try {
    console.log('Starting meeting point assignment process...');
    const body = await req.json();
    const { seasonId, classes } = body;

    if (!seasonId || !classes || !Array.isArray(classes)) {
      console.error('Invalid data: seasonId and classes are required.');
      return new NextResponse('Invalid data: seasonId and classes are required.', { status: 400 });
    }

    console.log(`Resetting meeting points for seasonId: ${seasonId}`);
    const timeslots = ['Friday', 'Saturday AM', 'Saturday PM', 'Sunday AM', 'Sunday PM'];
    timeslots.forEach((timeslot) => {
      resetMeetingPointCounters('SKI', timeslot);
      resetMeetingPointCounters('BOARD', timeslot);
    });

    console.log(`Processing ${classes.length} classes for meeting point assignment.`);

    for (const cls of classes) {
        const { classId, Level, discipline, progCode, DAY, startTime } = cls;
      
        const timeslot = `${DAY} ${startTime.includes('AM') ? 'AM' : 'PM'}`;
        const isSpecial = specialMaxSizePrograms.has(progCode);
      
        console.log(`Processing class ID: ${classId}, Level: ${Level}, discipline: ${discipline}, timeslot: ${timeslot}, isSpecial: ${isSpecial}`);
      
        // Adjust levelGroup logic
        const levelGroup = isSpecial
          ? 'special'
          : Level === '1-2'
          ? '1-2'
          : Level === '3-4'
          ? '3-4'
          : Level === '5-6'
          ? '5-6'
          : Level === '7+'
          ? '7+'
          : null;
      
        if (!levelGroup) {
          console.error(`Invalid Level value for class ID: ${classId}, Level: ${Level}`);
          skippedClasses.push({ classId, error: 'Invalid Level value.' });
          continue;
        }
      
        console.log(`Determined level group: ${levelGroup} for class ID: ${classId}`);
      

      try {
        const students = await prismadb.student.findMany({
          where: { classId },
          select: { UniqueID: true, BRTHD: true },
        });

        console.log(`Found ${students.length} students for class ID: ${classId}`);
        const ages = students.map((student) => calculateAge(student.BRTHD));
        console.log(`Student ages: ${ages}`);

        const { color, meetingPoint } = getNextMeetingPoint(discipline, levelGroup, isSpecial, timeslot);

        console.log(`Assigned meeting point: ${meetingPoint}, color: ${color} for class ID: ${classId}`);

        await prismadb.classes.update({
          where: { classId },
          data: { meetColor: color, meetingPoint },
        });

        console.log(`Updated class ID: ${classId} with meeting point: ${meetingPoint}, color: ${color}`);

        for (const student of students) {
          await prismadb.student.update({
            where: { UniqueID: student.UniqueID },
            data: { meetColor: color, meetingPoint },
          });
          console.log(`Updated student UniqueID: ${student.UniqueID} with meeting point: ${meetingPoint}, color: ${color}`);
        }
      } catch (error) {
        console.error(`Error processing class ID: ${classId} - ${error.message}`);
        skippedClasses.push({ classId, error: error.message });
      }
    }

    console.log('Skipped classes:', skippedClasses);

    return NextResponse.json({
      message: 'Meeting points assigned successfully, with some skipped classes.',
      skippedClasses,
    });
  } catch (error) {
    console.error('[assignMeetingPoints_POST] Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
