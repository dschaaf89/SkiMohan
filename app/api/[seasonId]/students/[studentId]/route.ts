import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
type Student = {
  UniqueID: number;
  NAME_FIRST: string;
  NAME_LAST: string;
  HOME_TEL: string;
  ADDRESS: string;
  CITY: string;
  STATE: string;
  ZIP: string;
  student_tel: string;
  Email_student: string | null;// Adjust nullability if needed
  BRTHD: string | Date; // Adjust based on the actual type
  AGE: number; // Adjust nullability if needed
  GradeLevel:  string | null;
  APPLYING_FOR:  string | null;
  LEVEL:  string | null;
  Approach:  string | null;
  E_mail_main:  string | null;
  E_NAME:  string | null;
  E_TEL:  string | null;
  CCPayment:  string | null;
  ProgCode:  string | null;
  BUDDY:  string | null;
  WComment:  string | null;
  DateFeePaid:  string | null;
  PaymentStatus:  string | null;
  AcceptedTerms:  string | null;
  AppType: number | null; // Adjust nullability if needed
  Employer:  string | null;
  C_TEL:  string | null;
  Occupation:  string | null;
  W_TEL:  string | null;
  AGE_GROUP: number | null; // Optional field
  AGRESSIVENESS: string | null;
  GENDER: string | null;
  FeeComment:string | null;
  DAY:string | null;
  StartTime: string | null;
  EndTime: string | null;
  classID: number | null;
  meetingPoint: number | null;
  meetColor:string | null;
  status:string;
  // include other properties as needed
}
export async function GET(
  req: Request,
  { params }: { params: { studentId: number } }
) {
  try {
    if (!params.studentId) {
      return new NextResponse("Student id is required", { status: 400 });
    }

    const student = await prismadb.student.findUnique({
      where: {
        UniqueID: params.studentId
      }
    });
  
    return NextResponse.json(student);
  } catch (error) {
    console.log('[Student_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
export async function DELETE(
  req: Request,
  { params }: { params: { studentId: string, seasonId: string } } // Notice `studentId` is a string here
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    const studentId = parseInt(params.studentId, 10); // Convert studentId to an integer

    if (isNaN(studentId)) {
      return new NextResponse("Invalid student ID", { status: 400 });
    }

    // const storeByUserId = await prismadb.season.findFirst({
    //   where: {
    //     id: params.seasonId,
    //     userId,
    //   }
    // });

    // if (!storeByUserId) {
    //   return new NextResponse("Unauthorized", { status: 405 });
    // }

    const student = await prismadb.student.delete({
      where: {
        UniqueID: studentId, // Use the converted integer
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.log('[BILLBOARD_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// export async function PATCH(
//   req: Request,
//   { params }: { params: { studentId: string, seasonId: string } }
// ) {
//   try {   
//     const { userId } = auth();

//     const body = await req.json();
    
//     const { id, NAME_FIRST, NAME_LAST,ADDRESS,CITY,STATE,HOME_TEL,ZIP,Email_student,GradeLevel,BRTHD,APPLYING_FOR,AGE,LEVEL,AppType,         
//       Approach,       
//       ProgCode,       
//       BUDDY,          
//       WComment,       
//       DateFeePaid,    
//       AGRESSIVENESS,  
//       GENDER, 
//       DAY,
//       StartTime,
//       EndTime,classID     } = body;
    
//     if (!userId) {
//       return new NextResponse("Unauthenticated", { status: 403 });
//     }

//     if (!NAME_FIRST) {
//       return new NextResponse("Label is required", { status: 400 });
//     }

//     if (!NAME_LAST) {
//       return new NextResponse("Image URL is required", { status: 400 });
//     }

//     if (!params.studentId) {
//       return new NextResponse("student id is required", { status: 400 });
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

//     const student = await prismadb.student.update({
//       where: {
//         id: params.studentId,
//       },
//       data: {
//         id,
//         NAME_FIRST,
//         NAME_LAST,
//         ADDRESS,
//         STATE,
//         CITY,
//         ZIP,
//         HOME_TEL,
//         Email_student,
//         GradeLevel,
//         BRTHD,
//         AGE,
//         APPLYING_FOR,
//         AppType,
//         LEVEL,         
//         Approach,       
//         ProgCode,       
//         BUDDY,          
//         WComment,       
//         DateFeePaid,    
//         AGRESSIVENESS,  
//         GENDER,
//         DAY,
//         StartTime,
//         EndTime,  
//         classID,    
//         seasonId: params.seasonId,
//       }
//     });
  
//     return NextResponse.json(student);
//   } catch (error) {
//     console.log('[Student_PATCH]', error);
//     return new NextResponse("Internal error", { status: 500 });
//   }
// };

// export async function PATCH(
//   req: Request,
//   { params }: { params: { studentId: string, seasonId: string } }
// ) {
 
//   try {
    
//     const { userId } = await auth(); // Implement actual authentication
//     if (!userId) {
//       return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 403 });
//     }

//     const body = await req.json();
//     console.log(`Updating student with ID: ${params.studentId}`, body);

//     // Update student information including status
//     const updatedStudent = await prismadb.student.update({
//       where: { id: params.studentId },
//       data: {
//         ...body, // Spread all updateable fields including 'status'
//         seasonId: params.seasonId // Ensure seasonId is maintained or updated appropriately
//       }
//     });
//     console.log(`Student updated:`, updatedStudent);

//     return new Response(JSON.stringify({ message: "Student updated successfully", student: updatedStudent }), { status: 200 });
//   } catch (error) {
//     console.error('[Student_PATCH] Error:', error);
//     return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
//   }
// }
export async function PATCH(req: Request, { params }: { params: { studentId: number, seasonId: string } }) {
  try {
    const body = await req.json();
    const studentId = parseInt(params.studentId.toString(), 10);

    console.log(`Updating student with ID: ${studentId}`, body);

    // Start a transaction to ensure all updates happen together
    const updatedStudent = await prismadb.$transaction(async (prisma) => {
      // Fetch the current student record to get the existing classId
      const existingStudent = await prisma.student.findUnique({
        where: { UniqueID: studentId },
        select: { classId: true }, // Only select the classId field
      });

      // Prepare the update data
      const updateData: any = {
        NAME_FIRST: body.NAME_FIRST,
        NAME_LAST: body.NAME_LAST,
        HOME_TEL: body.HOME_TEL,
        ADDRESS: body.ADDRESS,
        CITY: body.CITY,
        STATE: body.STATE,
        ZIP: body.ZIP,
        student_tel: body.student_tel,
        Email_student: body.Email_student,
        BRTHD: new Date(body.BRTHD),
        AGE: body.AGE,
        GradeLevel: body.GradeLevel,
        APPLYING_FOR: body.APPLYING_FOR,
        LEVEL: body.LEVEL,
        Approach: body.Approach,
        E_mail_main: body.E_mail_main,
        E_NAME: body.E_NAME,
        E_TEL: body.E_TEL,
        CCPayment: body.CCPayment,
        ProgCode: body.ProgCode,
        BUDDY: body.BUDDY,
        WComment: body.WComment,
        DateFeePaid: body.DateFeePaid,
        PaymentStatus: body.PaymentStatus,
        AcceptedTerms: body.AcceptedTerms,
        AppType: body.AppType,
        Employer: body.Employer,
        C_TEL: body.C_TEL,
        Occupation: body.Occupation,
        W_TEL: body.W_TEL,
        AGE_GROUP: body.AGE_GROUP,
        AGRESSIVENESS: body.AGRESSIVENESS,
        GENDER: body.GENDER,
        FeeComment: body.FeeComment,
        DAY: body.DAY,
        StartTime: body.StartTime,
        EndTime: body.EndTime,
        status: body.status,
        meetingPoint:body.meetingPoint,
        season: {
          connect: { id: params.seasonId },  // Correctly associate the season
        },
      };

      // Only update the class if it's provided and different from the existing one
      if (body.classID && existingStudent?.classId !== body.classID) {
        updateData.class = { connect: { classId: body.classID } };

        // Decrement the student count in the old class if applicable
        if (existingStudent?.classId) {
          await prisma.classes.update({
            where: { classId: existingStudent.classId },
            data: { numberStudents: { decrement: 1 } },
          });
        }

        // Increment the student count in the new class
        await prisma.classes.update({
          where: { classId: body.classID },
          data: { numberStudents: { increment: 1 } },
        });
      }

      // Update the student information
      const student = await prisma.student.update({
        where: { UniqueID: studentId },
        data: updateData,
      });

      return student;
    });

    console.log(`Student updated:`, updatedStudent);
    return new Response(JSON.stringify({ message: "Student updated successfully", student: updatedStudent }), { status: 200 });
  } catch (error) {
    console.error('[Student_PATCH] Error:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}



