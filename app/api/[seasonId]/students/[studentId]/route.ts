import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
type Student = {
  id:string;
  UniqueID: string;
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
  { params }: { params: { studentId: string } }
) {
  try {
    if (!params.studentId) {
      return new NextResponse("Student id is required", { status: 400 });
    }

    const student = await prismadb.student.findUnique({
      where: {
        id: params.studentId
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
  { params }: { params: { studentId: string, seasonId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.studentId) {
      return new NextResponse("Billboard id is required", { status: 400 });
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
        id: params.studentId,
      }
    });
  
    return NextResponse.json(student);
  } catch (error) {
    console.log('[BILLBOARD_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


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

export async function PATCH(req: Request, { params }: { params: { studentId: string, seasonId: string } }) {
  try {
   
    const body = await req.json();
    console.log(`Updating student with ID: ${params.studentId}`, body);

    // Update student information including status
    const updatedStudent = await prismadb.student.update({
      where: { id: params.studentId },
      data: {
        ...body, // Spread all updateable fields
        seasonId: params.seasonId // Ensure seasonId is maintained or updated appropriately
      }
    });
    console.log(`Student updated:`, updatedStudent);

    return new Response(JSON.stringify({ message: "Student updated successfully", student: updatedStudent }), { status: 200 });
  } catch (error) {
    console.error('[Student_PATCH] Error:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

