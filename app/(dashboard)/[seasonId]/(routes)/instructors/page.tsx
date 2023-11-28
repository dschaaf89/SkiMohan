import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { InstructorColumn } from "./components/columns"
import { InstructorClient } from "./components/client";

const InstructorPage = async ({
  params
}: {
  params: { seasonId: string }
}) => {
  const instructors = await prismadb.instructor.findMany({
    where: {
      seasonId: params.seasonId
    }
  });

  const formattedInstructors: InstructorColumn[] = instructors.map((item) => ({
    
  UniqueID: item.UniqueID || "",
  NAME_FIRST: item.NAME_FIRST || "",
  NAME_LAST: item.NAME_LAST|| "",
  HOME_TEL: item.HOME_TEL|| "",
  ADDRESS: item.ADDRESS|| "",
  CITY: item.CITY|| "",
  STATE: item.STATE|| "",
  ZIP: item.ZIP|| "",
  student_tel: item.student_tel|| "", // Assuming this field is present in your document
  Email_student: item.Email_student|| "",
  BRTHD: item.BRTHD ? format(new Date(item.BRTHD), "MM/dd/yyyy") : "",
  AGE: item.AGE || 0,// Assuming this field is present in your document and corresponds to DOB
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
}
  

  ));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <InstructorClient data={formattedInstructors} />
      </div>
    </div>
  );
};

export default InstructorPage;