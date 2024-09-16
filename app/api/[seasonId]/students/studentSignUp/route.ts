import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { mondayPrograms, tuesdayPrograms, thursdayPrograms, fridayNightPrograms, saturdayPrograms, sundayPrograms } from '../../../../(dashboard)/[seasonId]/(routes)/students/[studentId]/components/programDropdown';
import { differenceInYears } from 'date-fns'; // Import date difference function

let skiMeetingCounter = {
  1: 1,
  2: 8,
  3: 15,
  4: 22,
  5: 29,
  6: 36,
  7: 43,
};

let boardMeetingCounter = {
  1: 1,
  2: 8,
  3: 15,
  4: 22,
  5: 29,
  6: 36,
  7: 43,
};
const skiColors = ["red", "yellow", "green"];
let skiColorIndex = 0; 
// Age groups
const ageGroups = [
  { min: 6, max: 7 },
  { min: 8, max: 10 },
  { min: 11, max: 14 },
  { min: 15, max: 17 },
  { min: 18, max: Infinity },
];

// Function to find the appropriate age group for a student
const findAgeGroup = (age: number) => {
  return ageGroups.find(group => age >= group.min && (group.max === Infinity || age <= group.max));
};


// Helper function to get meeting points based on discipline and level
function getMeetingPoint(discipline: string, level: string) {
  let meetingPoint;
  let color;

  // Ensure level is treated as a number for arithmetic operations
  const numericLevel = parseInt(level, 10);

  if (discipline === "SKI") {
    color = skiColors[skiColorIndex];

    if (["1", "2", "3", "4", "5", "6", "7"].includes(level)) {
      meetingPoint = skiMeetingCounter[numericLevel]++;

      // If meeting points exceed 7, switch color and reset meeting point
      if (meetingPoint > (7 + (numericLevel - 1) * 7)) {
        skiColorIndex = (skiColorIndex + 1) % skiColors.length; // Cycle through colors
        skiMeetingCounter[numericLevel] = (numericLevel - 1) * 7 + 1; // Reset to the first meeting point of new color
        color = skiColors[skiColorIndex];
        meetingPoint = skiMeetingCounter[numericLevel]++;
      }
    }
  } else if (discipline === "BOARD") {
    color = "blue"; // Default to blue for Board, but no cycling
    if (["1", "2", "3", "4", "5", "6", "7"].includes(level)) {
      meetingPoint = boardMeetingCounter[numericLevel]++; // Keep the meeting points logic, but no color change
    }
  }

  return { color, meetingPoint };
}

// Function to determine discipline based on the program code
function determineDiscipline(programCode: string) {
  if (programCode.includes('-S-')) {
    return 'SKI';
  } else if (programCode.includes('-B-')) {
    return 'BOARD';
  } else if (programCode.includes('-T-')) {
    return 'TRANSPORTATION';
  }
  return null;
}

// Function to extract AppType from the program code
function determineAppType(programCode: string) {
  const appTypeCode = programCode.split('-').pop(); // Get the last part
  switch (appTypeCode) {
    case 'LO':
      return 1;  // LO = 1
    case 'TR':
      return 2;  // TR = 2
    case 'LT':
      return 3;  // LT = 3
    default:
      return null; // Fallback if not found
  }
}

// Helper function to find program details based on program code
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
}export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
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
      userId,
      LEVEL,
      E_mail_main,
      E_NAME,
      E_TEL,
      ProgCode,
      seasonId,
    } = body;

    console.log("Request Body:", body);

    if (!seasonId) {
      return new NextResponse("Season ID is required", { status: 400 });
    }

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    console.log("User ID to connect:", userId);

    const existingCustomer = await prismadb.customer.findUnique({
      where: { id: userId },
    });

    if (!existingCustomer) {
      console.error("Customer not found for userId:", userId);
      return new NextResponse("Customer not found", { status: 404 });
    }

    const discipline = determineDiscipline(ProgCode);
    console.log("Discipline:", discipline);

    if (!discipline) {
      return new NextResponse("Invalid Program Code", { status: 400 });
    }

    const appType = determineAppType(ProgCode);
    console.log("AppType:", appType);

    const programDetails = getProgramDetails(ProgCode);
    if (!programDetails) {
      return new NextResponse("Program not found", { status: 404 });
    }

    // Parse and calculate age from birthdate
    const birthDate = new Date(BRTHD);
    if (isNaN(birthDate.getTime())) {
      return new NextResponse("Invalid Birthdate", { status: 400 });
    }

    const currentDate = new Date("2025-01-01"); // Replace this date as needed
    const calculatedAge = differenceInYears(currentDate, birthDate);
    console.log("Calculated Age:", calculatedAge);

    // Find the age group of the student
    const studentAgeGroup = findAgeGroup(calculatedAge);
    if (!studentAgeGroup || studentAgeGroup.min === undefined || studentAgeGroup.max === undefined) {
      return new NextResponse("Age group not found or invalid", { status: 404 });
    }

    let classId = null;
    let color = null;
    let meetingPoint = null;

    if (discipline !== 'TRANSPORTATION') {
      const { color: classColor, meetingPoint: classMeetingPoint } = getMeetingPoint(discipline, LEVEL);
      color = classColor;
      meetingPoint = classMeetingPoint;

      console.log('Color:', color, 'Meeting Point:', meetingPoint);
      console.log('Skill Level:', LEVEL, 'Calculated Age:', calculatedAge);

      const suitableClass = await prismadb.classes.findFirst({
        where: {
          Level: LEVEL,
          discipline: ProgCode,
          numberStudents: { lt: 7 },
          seasonId: seasonId,
          meetColor: color,
          meetingPoint: meetingPoint,
          Age: {
            gte: studentAgeGroup.min,  // Use the minimum age of the group
            ...(studentAgeGroup.max !== Infinity && { lte: studentAgeGroup.max })  // Only apply lte if max is not Infinity
          },
        },
      });
      if (suitableClass) {
        classId = suitableClass.classId;
        await prismadb.classes.update({
          where: { classId: classId },
          data: { numberStudents: { increment: 1 } },
        });
      } else {
        const newClass = await prismadb.classes.create({
          data: {
            season: { connect: { id: seasonId } },
            Level: LEVEL,
            Age: calculatedAge, // Assign calculated age
            discipline: ProgCode,
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
    }

    const registrationDate = new Date(); // Capture the current date for DateFeePaid
    const formattedRegistrationDate = registrationDate.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format for string

    const student = await prismadb.student.create({
      data: {
        NAME_FIRST,
        NAME_LAST,
        HOME_TEL,
        ADDRESS,
        CITY,
        STATE,
        ZIP,
        student_tel: Email_student,
        BRTHD,
        AGE: calculatedAge, // Assign calculated age
        GradeLevel,
        LEVEL,
        APPLYING_FOR: discipline,  // Assigning discipline
        AppType: appType,  // Assigning AppType
        E_mail_main,
        E_NAME,
        E_TEL,
        ProgCode,
        DAY: programDetails.day,  // Assigning day
        StartTime: programDetails.startTime, // Assigning start time
        EndTime: programDetails.endTime,    // Assigning end time
        DateFeePaid: formattedRegistrationDate,  // Assigning registration date to DateFeePaid
        meetColor: color,  // Assigning meetColor
        meetingPoint: meetingPoint,  // Assigning meetingPoint
        season: { connect: { id: seasonId } },
        customer: { connect: { id: userId } },
        ...(classId && { class: { connect: { classId: classId } } }), // Connect to class only if not TRANSPORTATION
        AcceptedTerms: true,
      },
    });

    console.log("Student created successfully:", student);

    return NextResponse.json(student);
  } catch (error) {
    console.error('[StudentSignUp_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}