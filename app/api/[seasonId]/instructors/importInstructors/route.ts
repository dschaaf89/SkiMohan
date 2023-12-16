import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { differenceInYears } from "date-fns";
import prismadb from "@/lib/prismadb";

type InstructorData = {
  UniqueID: string;
  NAME_FIRST: string;
  NAME_LAST: string;
  HOME_TEL: string;
  C_TEL: string;
  BRTHD: string | Date;
  AGE: number;
  E_mail_main: string;
  ADDRESS: string;
  CITY: string;
  STATE: string;
  ZIP: string;
  STATUS: string;
  COMMENTS: string;
  prevYear: string;
  dateReg: string;
  dateConfirmed: string;
  emailCommunication: boolean;
  InstructorType: string;
  PSIA: string;
  AASI: string;
  testScore: string;
  ParentAuth: boolean;
  OverNightLodge: boolean;
  clinicInstructor: boolean;
  Supervisor: boolean;
  skiLevel: string;
  boardLevel: string;
  skiMinAge: string;
  skiMaxAge: string;
  boardMinAge: string;
  boardMaxAge: string;
  married: boolean;
  spouseName: string;
  instructorCom: string;
  noteToInstructor: string;
  priority: string;
  dateAssigned: string;
  assignmentConfirmed: string;
  classSignedUp: string;
  classAssigned: string;
  permSub: boolean;
  back2Back: boolean;
  classPerWeek: string;
  dateTimes: string;
  employeeNumber: string;
  payRate: string;
  deductions: string;
  payCheckNo: string;
  payCheckDate: string;
  payAdvance: string;
  payComment: string;
  ssn: string;
  payType: string;
  dateFeePaid: string;
  disclosureForm: boolean;
  i9Form: boolean;
  w4Recieved: boolean;
  WSPRecieved: boolean;
  testRecieved: boolean;
  idRecieved: boolean;
  schoolPermission: boolean;
  WSPDate: string;
  seasonId: string;
  createAt: Date;
  updateAt: Date;
  resume:string;
  ageRequestByStaff: Record<string, any>;
  clinics:Record<string, any>;
  [key: string]: any;
}

function calculateAge(birthdate: Date): number {
  const today = new Date();
  return differenceInYears(today, birthdate);
}
export async function POST(
  req: Request,
  { params }: { params: { seasonId: string } }
) {
  try {
    console.log(params.seasonId);
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.seasonId) {
      return new NextResponse("Season id is required", { status: 400 });
    }

    const body = await req.json();
    if (!Array.isArray(body) || body.length === 0 || !Array.isArray(body[0])) {
      return new NextResponse("Invalid data format", { status: 400 });
    }
    const validHeaders = [
      "UniqueID",
      "C_Tel",
      "NAME_FIRST",
      "NAME_LAST",
      "HOME_TEL",
      "BRTHD",
      "E_mail_main",
      "ADDRESS",
      "CITY",
      "STATE",
      "ZIP",
      "ApplyingFor",
      "WComment",
    ];
    const applyingForMapping: Record<string, string> = {
      "1": "Ski Instructor",
      "2": "Board Instructor",
      "3": "Ski And Board Instructor",
      "4": "Ski Assistant",
      "5": "Board Assistant",
      "6": "Ski and Board Assistant",
    };

    const headers: string[] = body[0];
    const instructorsData: InstructorData[] = body
      .slice(1)
      .map((instructorArray: any[]) => {
        const instructorObject: Partial<InstructorData> = {};
     

        headers.forEach((header, index) => {
          const value = instructorArray[index];
          if (validHeaders.includes(header)) {
            // Only process valid headers
            if (header === "UniqueID" && value) {
              instructorObject.UniqueID = value.toString();
            } else if (header === "ApplyingFor") {
              // Handle "ApplyingFor" to set "InstructorType"
              if (value && applyingForMapping.hasOwnProperty(value)) {
                instructorObject.InstructorType = applyingForMapping[value];
              }
            } else if (header === "WComment") {
              // Map "WComment" to "COMMENTS"
              instructorObject.COMMENTS = value === null ? "" : value.toString();
            }else {
              instructorObject[header] = value !== null && value !== undefined ? value.toString() : "";
            }
          }
        });
        
        // Convert BRTHD to ISO string and calculate age
        if (instructorObject.BRTHD) {
          const birthdate = new Date(instructorObject.BRTHD);
          if (!isNaN(birthdate.getTime())) {
            instructorObject.BRTHD = birthdate.toISOString();
            instructorObject.AGE = calculateAge(birthdate);
          } else {
            console.error(
              "Invalid birthdate format for instructor:",
              instructorObject
            );
          }
        }

        instructorObject.seasonId = params.seasonId;

        // Additional check for TypeScript
        if (typeof instructorObject.seasonId !== 'string') {
          throw new Error('seasonId is required and must be a string');
        }
        return instructorObject as InstructorData;
      });

    const createdInstructors = await prismadb.instructor.createMany({
      data: instructorsData,
      skipDuplicates: true, // Optionally skip duplicates, if your logic requires this
    });

    // Return a successful response
    return new NextResponse(
      JSON.stringify({
        message: "Instructors created successfully",
        data: createdInstructors,
      }),
      { status: 200 }
    );
  } catch (error: unknown) {
    // Indicate that error is of type unknown
    // Perform a type check
    if (error instanceof Error) {
      console.error("[MultiInstructor_POST]", error.message);
      return new NextResponse(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    } else {
      // If it's not an Error instance, handle it as a generic error
      console.error("[MultiInstructor_POST]", "An unexpected error occurred");
      return new NextResponse(
        JSON.stringify({ error: "An unexpected error occurred" }),
        { status: 500 }
      );
    }
  }
}
