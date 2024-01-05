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
      "NAME_FIRST",
      "NAME_LAST",
      "HOME_TEL",
      "E_MAIL", // This should map to E_mail_main in the data object
      "C_Tel",
      "BRTHD",
      "ADDRESS",
      "CITY",
      "STATE",
      "ZIP",
      "Employer", // You'll need to decide how to handle this, as it's not in the InstructorData type
      "Occupation", // Same as Employer
      "W_Tel", // Assuming this maps to a field in your data, otherwise you need to handle it
      "CCPayment", // Assuming this maps to a field in your data, otherwise you need to handle it
      "DateFeePaid",
      "PSIAcertification", // This should probably map to PSIA in the data object
      "AASIcertification", // This should probably map to AASI in the data object
      "NumDays", // You'll need to handle this, as it's not directly in the InstructorData type
      "Applying for", // This needs to be handled similarly to ApplyingFor in your existing code
      "PaymentStatus", // You'll need to handle this, as it's not directly in the InstructorData type
      "PROG_CODE", // You'll need to handle this, as it's not directly in the InstructorData type
      // Include all Clinic headers you want to process
      "Clinic1",
      "Clinic2",
      "Clinic3",
      "Clinic4",
      "Clinic5",
      "Clinic6",
      "AcceptedTerms", // Assuming this maps to disclosureForm or similar in your data
      // Include all Schedule headers you want to process
      "Schedule1",
      "Schedule2",
      "Schedule3",
      "Schedule4",
      "Schedule5 F",
      "Schedule6",
      "Schedule7 SatAM",
      "Schedule8 SatPM",
      "Schedule9 SunAM",
      "Schedule10 SunPM",
      "WComment",
      "returning" // You'll need to handle this, as it's not directly in the InstructorData type
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
          console.log(`Header: ${header}, Value: ${value}`); // Log the header and value for debugging
          // You might need to add additional validation or parsing logic here
          if (header === 'UniqueID') {
            instructorObject.UniqueID = value.toString();
          } else if (header === 'NAME_FIRST') {
            instructorObject.NAME_FIRST = value.toString();
          } else if (header === 'NAME_LAST') {
            instructorObject.NAME_LAST = value.toString();
          } else if (header === 'HOME_TEL') {
            instructorObject.HOME_TEL = value.toString();
          } else if (header === 'E_MAIL' || header === 'E-mail_main') {
            instructorObject.E_mail_main = value.toString();
          } else if (header === 'C_TEL') {
            instructorObject.C_TEL = value.toString();
          } else if (header === 'BRTHD') {
            // Parse birthdate and calculate age
            const birthdate = new Date(value);
            instructorObject.BRTHD = birthdate.toISOString();
            instructorObject.AGE = calculateAge(birthdate);
          } else if (header === 'ADDRESS') {
            instructorObject.ADDRESS = value.toString();
          } else if (header === 'CITY') {
            instructorObject.CITY = value.toString();
          } else if (header === 'STATE') {
            instructorObject.STATE = value.toString();
          } else if (header === 'ZIP') {
            instructorObject.ZIP = value.toString();
          } else if (header === 'Employer') {
            // Map to a relevant field or add a new field if necessary
          } else if (header === 'Occupation') {
            // Map to a relevant field or add a new field if necessary
          } else if (header === 'W_Tel') {
            // Map to a relevant field or add a new field if necessary
          } else if (header === 'CCPayment') {
            // Map to a relevant field or add a new field if necessary
          } else if (header === 'DateFeePaid') {
            instructorObject.dateFeePaid = value.toString();
          } else if (header === 'PSIAcertification') {
            instructorObject.PSIA = value.toString();
          } else if (header === 'AASIcertification') {
            instructorObject.AASI = value.toString();
          } else if (header === 'NumDays') {
            // Map to a relevant field or add a new field if necessary
          } else if (header === 'Applying for') {
            const roleKey = value.toString(); // Make sure the value is a string to match the keys in your mapping object
            const roleValue = applyingForMapping[roleKey]; // Look up the corresponding role in the mapping object
          
            if (roleValue) {
              instructorObject.InstructorType = roleValue;
            } else {
              console.log(`Invalid role key: ${roleKey}`);
              // Handle the case where the role key is not found in the mapping object, e.g., set a default value or skip it
            }          } else if (header === 'PaymentStatus') {
            // Map to a relevant field or add a new field if necessary
          } else if (header === 'PROG_CODE') {
            // Map to a relevant field or add a new field if necessary
          }else if (header === 'AcceptedTerms') {
            instructorObject.disclosureForm = value === 'Yes'; // Assuming 'Yes' means accepted
          } else if (header.startsWith('Schedule')) {
            // Handle Schedule fields, perhaps as an array or sub-object
          } else if (header === 'WComment') {
            instructorObject.COMMENTS = value === null ? "" : value.toString();
          } else if (header === 'returning') {
            // Map to a relevant field or add a new field if necessary
          }
          // Add more else if blocks for other headers
          console.log(`Current state of instructorObject after processing ${header}:`, instructorObject);
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
        console.log('Mapped instructor object:', instructorObject);

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
