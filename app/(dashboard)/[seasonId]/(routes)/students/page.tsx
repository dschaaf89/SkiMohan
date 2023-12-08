import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { StudentColumn } from "./components/columns"
import { StudentClient } from "./components/client";



const StudentPage = async ({
  params
}: {
  params: { seasonId: string }
}) => {
  const students = await prismadb.student.findMany({
    where: {
      seasonId: params.seasonId
    }
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
  AGE_GROUP: item.AGE_GROUP|| "", // Optional field (not present in your Prisma model
  GENDER: item.GENDER|| "",
  FeeComment:item.FeeComment|| "",
  AGRESSIVENESS:item.AGRESSIVENESS|| "",
  DAY: item.DAY || "",
  StartTime:item.StartTime || "",
  EndTime: item.EndTime || "",
  //updateAt:item.updateAt ? format(new Date(item.updateAt), "MM/dd/yyyy") : "",
}
  

  ));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <StudentClient data={formattedStudents} />
      </div>
    </div>
  );
};

export default StudentPage;