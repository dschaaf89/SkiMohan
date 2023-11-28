import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { differenceInYears } from "date-fns";
import prismadb from "@/lib/prismadb";

type StudentData = {
  UniqueID: string;
  NAME_FIRST: string;
  NAME_LAST: string;
  HOME_TEL: string;
  ADDRESS: string;
  CITY: string;
  STATE: string;
  ZIP: string;
  student_tel: string;
  Email_student: string; // Adjust nullability if needed
  BRTHD: string | Date; // Adjust based on the actual type
  AGE: number; // Adjust nullability if needed
  GradeLevel: string;
  APPLYING_FOR: string;
  LEVEL: string;
  Approach: string;
  E_mail_main: string;
  E_NAME: string;
  E_TEL: string;
  CCPayment: string;
  ProgCode: string;
  BUDDY: string;
  WComment: string;
  DateFeePaid: string;
  PaymentStatus: string;
  AcceptedTerms: string;
  AppType: number; // Adjust nullability if needed
  Employer: string;
  C_TEL: string;
  Occupation: string;
  W_TEL: string;
  AGE_GROUP: string; // Optional field
  AGRESSIVENESS: string;
  GENDER: string;
  FeeComment:string;
  DAY:string;
  StartTime: string;
  EndTime:string;
  seasonId:string;
  [key: string]: any;
}

function calculateAge(birthdate: Date): number {
  const today = new Date();
  return differenceInYears(today, birthdate);
}
function mapAppTypeValue (value:number):number{
  switch (value){
    case 1:
      return 1;
    case 2:
      return 2;
    case 3:
      return 3;
      default:
        return 0;
  }
}
function mapApplyingForValue (value:string):string{
  switch (value){
    case "transportation":
      return "Transportation";
    case "ski":
      return "SKI";
    case "board":
      return "BOARD";
      default:
        return "";
  }
}
function mapLevelValue(value: string): string {
  switch (value) {
    case "S1":
      return "1/2 novice";
    case "S2":
      return "1/2 novice"; // Map "S2" to "1/2 novice" option
    case "S3":
      return "3/4 inter"; // Map "S3" to "3/4 inter" option
    case "S4": 
      return "3/4 inter";
      case "S5": 
      return "5/6 adv inter";
      case "S6": 
      return "5/6 adv inter";
      case "S7": 
      return "7/8 advance";
      case "S8": 
      return "7/8 advance";
      case "S9": 
      return "9 atac";
      case "B1":
        return "1/2 novice";
      case "B2":
        return "1/2 novice"; // Map "S2" to "1/2 novice" option
      case "B3":
        return "3/4 inter"; // Map "S3" to "3/4 inter" option
      case "B4": 
        return "3/4 inter";
        case "B5": 
        return "5/6 adv inter";
        case "B6": 
        return "5/6 adv inter";
        case "B7": 
        return "7/8 advance";
        case "B8": 
        return "7/8 advance";
        case "B9": 
        return "9 atac";
      
    // Add more cases for other values as needed
    default:
      return ""; // Return an empty string for unsupported values
  }
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
    const studentsData: StudentData[] = body.slice(1).map((studentArray: any[]) => {
      const studentObject: Partial<StudentData> = {};
      headers.forEach((header, index) => {
        const value = studentArray[index];
        if (header === 'Email_student') {
          // Convert null to an empty string for Email_student
          studentObject[header] = value === null ? '' : value.toString();
        }else if (header === 'APPLYING_FOR') { // Add this condition for 'AGE_GROUP'Q
          studentObject[header] = mapApplyingForValue(value); // You can set an appropriate value for AGE_GROUP here
        } else if (header === 'student_tel') { // Add this condition for 'AGE_GROUP'Q
          studentObject[header] = ''; // You can set an appropriate value for AGE_GROUP here
        } else if (header === 'HOME_TEL') {
          // If parsing fails or value is null, set to undefined instead of null
          studentObject[header] = value === null ? '' : value.toString();
        }else  if (header === 'LEVEL') {
          // Map the "LEVEL" value to the radio button option
          studentObject[header] = mapLevelValue(value);} 
        else if (header === 'AGE') {
          // Convert null to a default value (e.g., 0) for AGE
          studentObject[header] = value === null ? 0 : value;
        } else if (header === 'AppType') {
          // Convert string to a number for AppType
          studentObject[header] = mapAppTypeValue(value); 
        } else if (header === 'E_mail_main') { // Add this condition for 'E_mail_main'
          studentObject['E_mail_main'] = value === null ? '' : value.toString();
        }else if (header === 'BUDDY') { // Add this condition for 'E_mail_main'
          studentObject['BUDDY'] = value === null ? '' : value.toString();
        }else if (header === 'AGE_GROUP') { // Add this condition for 'AGE_GROUP'Q
          studentObject[header] = ''; // You can set an appropriate value for AGE_GROUP here
        }else if (header === 'AcceptedTerms') { // Add this condition for 'AGE_GROUP'Q
          studentObject[header] = ''; // You can set an appropriate value for AGE_GROUP here
        } else if (header === 'WComment') { // Add this condition for 'AGE_GROUP'
          studentObject[header] = ''; // You can set an appropriate value for AGE_GROUP here
        }else {
          studentObject[header] = typeof value === 'string' || value === null ? value : value.toString();
        }
      });
      

      // Convert BRTHD to ISO string if it exists
      if (typeof studentObject.BRTHD === 'string') {
        const birthdate = new Date(studentObject.BRTHD);
        if (!isNaN(birthdate.getTime())) {
          studentObject.BRTHD = birthdate.toISOString();
          studentObject.AGE = calculateAge(birthdate);
        } 
      }

      console.log('params.seasonId:', params.seasonId); // Add this line to check the value
return { ...studentObject as StudentData, seasonId: params.seasonId };

    });

    const createdStudents = await prismadb.student.createMany({
      data: studentsData,
      skipDuplicates: true, // Optionally skip duplicates, if your logic requires this
    });

    // Return a successful response
    return new NextResponse(JSON.stringify({ message: "Students created successfully", data: createdStudents }), { status: 200 });

  } catch (error: unknown) { // Indicate that error is of type unknown
    // Perform a type check
    if (error instanceof Error) {
      console.error("[MultiStudent_POST]", error.message);
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    } else {
      // If it's not an Error instance, handle it as a generic error
      console.error("[MultiStudent_POST]", "An unexpected error occurred");
      return new NextResponse(JSON.stringify({ error: "An unexpected error occurred" }), { status: 500 });
    }
}
}