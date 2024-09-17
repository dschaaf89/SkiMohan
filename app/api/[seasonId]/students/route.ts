// import { NextResponse } from 'next/server';
// import { auth } from '@clerk/nextjs'


// import prismadb from '@/lib/prismadb';




// export async function POST(
//   req: Request,
//   { params }: { params: { seasonId: string } }
// ) {
//   console.log('POST function called'); // Add this line
//   try {
//     const { userId } = auth();
//     console.log('User ID:', userId); 
//     const body = await req.json();
//     console.log('Request Body:', body);
//     const {
//       NAME_FIRST,
//       NAME_LAST,
//       HOME_TEL,
//       ADDRESS,
//       CITY,
//       STATE,
//       ZIP,
//       student_tel,
//       Email_student,
//       BRTHD,
//       GradeLevel,
//       APPLYING_FOR,
//       LEVEL,
//       Approach,
//       E_mail_main,
//       E_NAME,
//       E_TEL,
//       CCPayment,
//       ProgCode,
//       BUDDY,
//       WComment,
//       DateFeePaid,
//       PaymentStatus,
//       AcceptedTerms,
//       AppType,
//       Employer,
//       C_TEL,
//       Occupation,
//       W_TEL,
//       AGE,
//       AGRESSIVENESS,
//       AGE_GROUP,
//       GENDER,
//       FeeComment,
//       DAY,
//       StartTime,
//       EndTime,
//       customerId,
//     } = body;


//     if (!userId) {
//       return new NextResponse("Unauthenticated", { status: 403 });
//     }

//     if (!NAME_FIRST) {
//       return new NextResponse("Label is required", { status: 400 });
//     }

//     if (!NAME_LAST) {
//       return new NextResponse("Image URL is required", { status: 400 });
//     }

//     if (!params.seasonId) {
//       return new NextResponse("Store id is required", { status: 400 });
//     }

//     // const storeByUserId = await prismadb.season.findFirst({
//     //   where: {
//     //     id: params.seasonId,
//     //     userId,
//     //   }
//     // });

//     // if (!storeByUserId) {
//     //   return new NextResponse("Unauthorized", { status: 405 });
//     // }

    

//     const student = await prismadb.student.create({
//       data: {
      
//         NAME_FIRST,
//         NAME_LAST,
//         HOME_TEL,
//         ADDRESS,
//         CITY,
//         STATE,
//         ZIP,
//         student_tel,
//         Email_student,
//         BRTHD,
//         GradeLevel,
//         APPLYING_FOR,
//         LEVEL,
//         Approach,
//         E_mail_main,
//         E_NAME,
//         E_TEL,
//         CCPayment,
//         ProgCode,
//         BUDDY,
//         WComment,
//         DateFeePaid,
//         PaymentStatus,
//         AcceptedTerms,
//         AppType,
//         Employer,
//         C_TEL,
//         Occupation,
//         W_TEL,
//         AGE,
//         AGE_GROUP,
//         GENDER,
//         AGRESSIVENESS,
//         FeeComment,
//         DAY,
//         StartTime,
//         EndTime,
//         customerId,
//         seasonId: params.seasonId,
//       },
//     });
//     console.log('Student Created:', student);
//     return NextResponse.json(student);
//   } catch (error) {
//     console.log('[Students_POST]', error);
//     return new NextResponse("Internal error", { status: 500 });
//   }
// }
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prismadb from '@/lib/prismadb';

let skiMeetingCounter = 1;
let boardMeetingCounter = 1;

function getMeetingPoint(discipline: string, level: string) {
    let meetingPoint;
    let color;

    if (discipline === "SKI") {
        color = "red";
        if (level === "1" || level === "2" || level === "3") {
            meetingPoint = skiMeetingCounter++;
        } else if (level === "4" || level === "5" || level === "6") {
            meetingPoint = 20 + skiMeetingCounter++;
        } else if (level === "7" || level === "8" || level === "9") {
            meetingPoint = 40 + skiMeetingCounter++;
        }
    } else if (discipline === "BOARD") {
        color = "blue";
        if (level === "1" || level === "2" || level === "3") {
            meetingPoint = boardMeetingCounter++;
        } else if (level === "4" || level === "5" || level === "6") {
            meetingPoint = 20 + boardMeetingCounter++;
        } else if (level === "7" || level === "8" || level === "9") {
            meetingPoint = 40 + boardMeetingCounter++;
        }
    }

    return { color, meetingPoint };
}
export async function POST(req: Request, { params }: { params: { seasonId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const {
      NAME_FIRST,
      NAME_LAST,
      HOME_TEL,
      ADDRESS,
      CITY,
      STATE,
      ZIP,
      student_tel,
      Email_student,
      BRTHD,
      GradeLevel,
      APPLYING_FOR,
      LEVEL,
      Approach,
      E_mail_main,
      E_NAME,
      E_TEL,
      CCPayment,
      ProgCode,
      BUDDY,
      WComment,
      DateFeePaid,
      PaymentStatus,
      AcceptedTerms,
      AppType,
      Employer,
      C_TEL,
      Occupation,
      W_TEL,
      AGE, // This comes from the front end, but you should ensure it's accurate
      GENDER,
      AGRESSIVENESS,
      FeeComment,
      DAY,
      StartTime,
      EndTime,
      customerId,
    } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Define the age groups, including 5-year-olds
    const ageGroups = [
      { min: 5, max: 7 },  // Updated to include younger ages
      { min: 8, max: 10 },
      { min: 11, max: 14 },
      { min: 15, max: 17 },
      { min: 18, max: Infinity },
    ];

    // Find the student's age group based on their age
    const studentAgeGroup = ageGroups.find(group => AGE >= group.min && AGE <= group.max);

    if (!studentAgeGroup) {
      return new NextResponse("Age group not found for the student's age", { status: 400 });
    }

    // Dynamically set the AGE_GROUP value as the minimum of the group (integer)
    const AGE_GROUP = studentAgeGroup.min;

    // Get meeting point for the student's discipline (Ski/Board)
    const { color, meetingPoint } = getMeetingPoint(APPLYING_FOR, LEVEL);

    // Find or create a suitable class for the student
    const suitableClass = await prismadb.classes.findFirst({
      where: {
        Level: LEVEL,
        Age: {
          gte: studentAgeGroup.min,
          ...(studentAgeGroup.max < Infinity && { lte: studentAgeGroup.max }),
        },
        discipline: APPLYING_FOR,
        numberStudents: { lt: 7 }, // Ensure the class isn't full
        seasonId: params.seasonId,
        meetColor: color,
        meetingPoint: meetingPoint,
      },
    });

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
          season: { connect: { id: params.seasonId } },
          Level: LEVEL,
          Age: AGE,
          discipline: APPLYING_FOR,
          numberStudents: 1,
          day: DAY,
          progCode: ProgCode,
          meetColor: color,
          meetingPoint: meetingPoint,
        },
      });
      classId = newClass.classId;
    }

    // Create the student and assign them to the determined class
    const createdStudent = await prismadb.student.create({
      data: {
        NAME_FIRST,
        NAME_LAST,
        HOME_TEL,
        ADDRESS,
        CITY,
        STATE,
        ZIP,
        student_tel,
        Email_student,
        BRTHD,
        GradeLevel,
        APPLYING_FOR,
        LEVEL,
        Approach,
        E_mail_main,
        E_NAME,
        E_TEL,
        CCPayment,
        ProgCode,
        BUDDY,
        WComment,
        DateFeePaid,
        PaymentStatus,
        AcceptedTerms,
        AppType,
        Employer,
        C_TEL,
        Occupation,
        W_TEL,
        AGE,
        AGE_GROUP,  // Now it’s an integer
        GENDER,
        AGRESSIVENESS,
        FeeComment,
        DAY,
        StartTime,
        EndTime,
        customerId,
        classId: classId,
        seasonId: params.seasonId,
      },
    });

    return NextResponse.json(createdStudent);
  } catch (error) {
    console.error('[POST Error]', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}