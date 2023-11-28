import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { differenceInYears } from "date-fns";
import prismadb from "@/lib/prismadb";

type InstructorData = {
  UniqueID: string;
  NAME_FIRST: string;
  NAME_LAST: string;
  HOME_TEL: string;
  E_MAIL: string;
  C_TEL: string;
  BRTHD: string | Date;
  E_mail_main: string;
  ADDRESS: string;
  CITY: string;
  STATE: string;
  ZIP: string;
  Employer: string;
  Occupation: string;
  W_Tel: string;
  CCPayment: string;
  DateFeePaid: string | Date;
  PSIAcertification: number;
  AASIcertification: number;
  NumDays: number;
  ApplyingFor: number;
  PaymentStatus: string;
  PROG_CODE: string;
  Clinic1: string;
  Clinic2: string;
  Clinic3: string;
  Clinic4: string;
  Clinic5: string;
  Clinic6: string;
  AcceptedTerms: boolean;
  Schedule1: boolean;
  Schedule2: boolean;
  Schedule3: boolean;
  Schedule4: boolean;
  Schedule5: boolean;
  Schedule6: boolean;
  Schedule7: boolean;
  Schedule8: boolean;
  Schedule9: boolean;
  WComment: string;
  returning: boolean;
  createAt: Date;
  updateAt: Date;
  seasonId:string;
  [key: string]: any;
}

function calculateAge(birthdate: Date): number {
  const today = new Date();
  return differenceInYears(today, birthdate);
}
export async function POST(req: Request, { params }: { params: { seasonId: string } }) {
  try {
    console.log(params.seasonId)
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
    
    const headers: string[] = body[0];
    const instructorsData: InstructorData[] = body.slice(1).map((instructorArray: any[]) => {
      const instructorObject: Partial<InstructorData> = {};
      headers.forEach((header, index) => {
        const value = instructorArray[index];
        if (header === 'E_MAIL') {
          instructorObject[header] = value === null ? '' : value.toString();
        } else if (header === 'HOME_TEL' || header === 'C_TEL' || header === 'W_Tel') {
          instructorObject[header] = value === null ? '' : value.toString();
        } else if (header === 'BRTHD' || header === 'DateFeePaid') {
          instructorObject[header] = value ? new Date(value) : undefined;
        } else if (header === 'PSIAcertification' || header === 'AASIcertification' || header === 'NumDays' || header === 'ApplyingFor') {
          instructorObject[header] = typeof value === 'string' ? parseInt(value, 10) : value;
        } else if (header === 'AcceptedTerms' || header.startsWith('Schedule')) {
          instructorObject[header] = value === 'Yes';
        } else if (header === 'WComment' || header === 'Employer' || header === 'Occupation' || header === 'PROG_CODE') {
          instructorObject[header] = value === null ? '' : value.toString(); 
        } else if (header === 'returning') {
          instructorObject[header] = value === 'Yes' || value === 'true';
        }else {
          instructorObject[header] = typeof value === 'string' || value === null ? value : value.toString();
        }
        
      });
    
      // Convert BRTHD to ISO string and calculate age
      if (instructorObject.BRTHD && typeof instructorObject.BRTHD === 'string') {
        const birthdate = new Date(instructorObject.BRTHD);
        if (!isNaN(birthdate.getTime())) {
          instructorObject.BRTHD = birthdate.toISOString();
          // Assuming you have an 'AGE' field in InstructorData
          // instructorObject.AGE = calculateAge(birthdate);
        } 
      }
      const seasonId = params.seasonId;
      return { ...instructorObject as InstructorData, seasonId: params.seasonId };
    });

    const createdInstructors = await prismadb.instructor.createMany({
      data: instructorsData,
      skipDuplicates: true, // Optionally skip duplicates, if your logic requires this
    });

    // Return a successful response
    return new NextResponse(JSON.stringify({ message: "Instructors created successfully", data: createdInstructors }), { status: 200 });

  } catch (error: unknown) { // Indicate that error is of type unknown
    // Perform a type check
    if (error instanceof Error) {
      console.error("[MultiInstructor_POST]", error.message);
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    } else {
      // If it's not an Error instance, handle it as a generic error
      console.error("[MultiInstructor_POST]", "An unexpected error occurred");
      return new NextResponse(JSON.stringify({ error: "An unexpected error occurred" }), { status: 500 });
    }
}
}