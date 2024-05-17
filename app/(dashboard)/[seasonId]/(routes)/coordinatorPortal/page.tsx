import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { CoordinatorClient } from "./components/client";
import { VolunteerClient } from "../volunteers/components/client";
import { VolunteerColumn } from "../volunteers/components/columns";
import { WaitlistClient } from "../waitlist/components/client";
import { StudentColumn } from "../students/components/columns";
import { WaitlistColumn } from "../waitlist/components/columns";


const CoordinatorPage = async ({
  params
}: {
  params: { seasonId: string }
}) => {
  const students = await prismadb.student.findMany({
    where: {
      seasonId: params.seasonId
    }
  });
  const volunteers = await prismadb.volunteer.findMany({
    where:{
      seasonId:params.seasonId
    }
  })

  const waitlistStudents = await prismadb.student.findMany({
    where: {
      seasonId: params.seasonId,
      status: 'Waitlist',  // Filtering by 'Waitlist' status
    },
  });

  const formattedStudents: StudentColumn[] = students.map((item) => ({
  id:item.id,
  UniqueID: item.UniqueID || "",
  NAME_FIRST: item.NAME_FIRST || "",
  NAME_LAST: item.NAME_LAST|| "",
  HOME_TEL: item.HOME_TEL || "",
  ADDRESS: item.ADDRESS|| "",
  CITY: item.CITY|| "",
  STATE: item.STATE|| "",
  ZIP: item.ZIP|| "",
  student_tel: item.student_tel|| "", // Assuming this field is present in your document
  Email_student: item.Email_student|| "",
  BRTHD: item.BRTHD ? format(new Date(item.BRTHD), "MM/dd/yyyy") : "",
  AGE: item.AGE,// Assuming this field is present in your document and corresponds to DOB
  GradeLevel: item.GradeLevel|| "",
  APPLYING_FOR: item.APPLYING_FOR|| "",
  LEVEL: item.LEVEL|| "",
  Approach: item.Approach|| "",
  E_mail_main: item.E_mail_main|| "", // Assuming this field is present in your document
  E_NAME: item.E_NAME|| "", // Assuming this field is present in your document
  E_TEL: item.E_TEL|| "", // Assuming this field is present in your document
  CCPayment: item.CCPayment|| "", // Assuming this field is present in your document
  ProgCode: item.ProgCode|| "",
  BUDDY: item.BUDDY|| "",
  WComment: item.WComment|| "",
  DateFeePaid: item.DateFeePaid|| "",
  PaymentStatus: item.PaymentStatus|| "", // Assuming this field is present in your document
  AcceptedTerms: item.AcceptedTerms|| "", // Assuming this field is present in your document
  AppType: item.AppType|| 0, // Assuming this field is present in your document
  Employer: item.Employer|| "", // Assuming this field is present in your document
  C_TEL: item.C_TEL|| "", // Assuming this field is present in your document
  Occupation: item.Occupation|| "", // Assuming this field is present in your document
  W_TEL: item.W_TEL|| "", // Assuming this field is present in your document
  AGE_GROUP: item.AGE_GROUP|| 0, // Optional field (not present in your Prisma model
  GENDER: item.GENDER|| "",
  FeeComment:item.FeeComment|| "",
  AGRESSIVENESS:item.AGRESSIVENESS|| "",
  DAY: item.DAY || "",
  StartTime:item.StartTime || "",
  EndTime: item.EndTime || "",
  classID: item.classID||0, // Assign null if undefined
  meetingPoint: item.meetingPoint !== undefined ? item.meetingPoint : null,
  meetColor: item.meetColor ||null,
  updateAt:item.updateAt ? format(new Date(item.updateAt), "MM/dd/yyyy") : "",
  status:item.status,
}
  

  ));

  const formattedVolunteers: VolunteerColumn[] = volunteers.map((item) => ({
    id:item.id,
    firstName: item.firstName,
    lastName: item.lastName,
    birthDate: item.birthDate,
    homePhone: item.homePhone || null,
    mobilePhone: item.mobilePhone,
    workPhone: item.workPhone || null,
    Address: item.Address,
    city: item.city,
    state: item.state,
    zipCode: item.zipCode,
    email: item.email,
    employerSchool: item.employerSchool || null,
    occupationGrade: item.occupationGrade || null,
    isGreeter: item.isGreeter,
    isProgramCoordinator: item.isProgramCoordinator,
    isBusChaperone: item.isBusChaperone,
    busChaperoneSchool: item.busChaperoneSchool || null,
    isEmergencyDriver: item.isEmergencyDriver,
    emergencyDriverDay: item.emergencyDriverDay || null,
    applicantStatus: item.applicantStatus as "Returning" | "New", // Type assertion
    agreeToTerms: item.agreeToTerms,
    busChaperoneWk1: item.busChaperoneWk1,
    busChaperoneWk2: item.busChaperoneWk2,
    busChaperoneWk3: item.busChaperoneWk3,
    busChaperoneWk4: item.busChaperoneWk4,
    busChaperoneWk5: item.busChaperoneWk5,
    busChaperoneWk6: item.busChaperoneWk6,
    emergencyDriverWk1: item.emergencyDriverWk1,
    emergencyDriverWk2: item.emergencyDriverWk2,
    emergencyDriverWk3: item.emergencyDriverWk3,
    emergencyDriverWk4: item.emergencyDriverWk4,
    emergencyDriverWk5: item.emergencyDriverWk5,
    emergencyDriverWk6: item.emergencyDriverWk6,
  }));

  const formattedWaitlist: WaitlistColumn[] = waitlistStudents.map((student) => ({
    id: student.id,
    NAME_FIRST: student.NAME_FIRST,
    NAME_LAST: student.NAME_LAST,
    HOME_TEL: student.HOME_TEL,
    E_mail_main: student.E_mail_main || "", // Provide a default empty string
    ProgCode: student.ProgCode || "", // Default empty string for ProgCode
  }));

  const allData = {
    students: formattedStudents,
    volunteers: formattedVolunteers,
    waitlistStudents: formattedWaitlist // Change this to match the type of StudentColumn[]
  };
  
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CoordinatorClient data={allData} />
      </div>
    </div>
  );
};

export default CoordinatorPage;