import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
interface Student {
  id: string;
  // include other properties that your student objects have
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

export async function PATCH(
  req: Request,
  { params }: { params: { studentId: string, seasonId: string } }
) {
  try {
    const { userId } = await auth(); // Implement actual authentication
    console.log(`Authenticating user: ${userId}`);
    if (!userId) {
      console.log(`Unauthenticated access attempt.`);
      return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 403 });
    }

    const body = await req.json();
    const { status, ...updateData } = body;
    console.log(`Updating student with ID: ${params.studentId}`, updateData);

    // First, update the student's record
    const updatedStudent = await prismadb.student.update({
      where: { id: params.studentId },
      data: updateData,
    });
    console.log(`Student updated:`, updatedStudent);

    // If marked as 'Unregistered', proceed to update class information
    if (status === 'Unregistered') {
      console.log(`Processing unregistration for student ID: ${params.studentId}`);
      // Find the class using classID from the student
      const student = await prismadb.student.findUnique({
        where: { id: params.studentId },
        select: { classID: true },
      });

      console.log(`Retrieved classID for student:`, student!.classID);

      if (student && student.classID) {
        const classInfo = await prismadb.classes.findUnique({
          where: { classId: student.classID },
        });

        console.log(`Retrieved class information:`, classInfo);

        if (classInfo && typeof classInfo.students === 'string') {
          // Assuming classInfo.students is actually a relational structure in your database
          // and not just a string that needs to be parsed. The disconnect operation would look like this:
        
          const studentIdToRemove = params.studentId; // The ID of the student to disconnect
        
          // Proceed to update the class with the student removed
          const updatedClass = await prismadb.classes.update({
            where: { classId: student.classID }, // Ensure you're targeting the correct class
            data: {
              students: {
                disconnect: [{ id: studentIdToRemove }], // Disconnecting the specific student
              },
              // Assuming you need to manually adjust the number of students
              // This might not be necessary if your ORM/database automatically handles this based on the relations
              numberStudents: { decrement: 1 } // Optional: Adjust this based on your specific needs
            },
          });
          console.log(`Class updated with the student disconnected:`, updatedClass);
        }
//find the studentID, remove from the JSON students array then make sure the object has all the other values. try using the splice method. removeDocument(doc){
//    this.documents.forEach( (item, index) => {
//     if(item === doc) this.documents.splice(index,1);
//   });
// }
// if (classInfo && typeof classInfo.students === 'string') {
//   // Parse the JSON string to get an array of student IDs
//   const studentsArray = JSON.parse(classInfo.students);

//   // Log the student array before removal
//   console.log(`Students array before removal:`, studentsArray);

//   // Find the index of the student ID to remove
//   const indexToRemove = studentsArray.findIndex((id: string) => id === params.studentId);
  
//   // If the student ID is found, remove it from the array
//   if (indexToRemove !== -1) {
//     studentsArray.splice(indexToRemove, 1); // Remove the student ID from the array
//     console.log(`Student ID ${params.studentId} removed from the array.`);
//   }

//   // Log the student array after removal
//   console.log(`Students array after removal:`, studentsArray);
// //

//   // Proceed to update the class with the modified students array
//   const updatedClass = await prismadb.classes.update({
//     where: { classId: student.classID },
//     data: {
//       students: JSON.stringify(studentsArray), // Convert the array back to a JSON string
//       numberStudents: studentsArray.length, // Update the number of students
//     },
//   });
//   console.log(`Class updated with the student removed:`, updatedClass);
// }
      }
    }

    return new Response(JSON.stringify({ message: "Student updated successfully" }), { status: 200 });
  } catch (error) {
    console.error('[Student_PATCH] Error:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}