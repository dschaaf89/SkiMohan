import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { WaitlistColumn } from "./components/columns";
import { WaitlistClient } from "./components/client";

const WaitlistPage = async ({ params }: { params: { seasonId: string } }) => {
  try {
    const waitlist = await prismadb.student.findMany({
      where: {
        seasonId: params.seasonId,
        status: 'Waitlist',
      },
    });

    const formattedWaitlist: WaitlistColumn[] = waitlist.map((student) => ({
      id: student.id,
      UniqueID: student.UniqueID || "",
      NAME_FIRST: student.NAME_FIRST || "",
      NAME_LAST: student.NAME_LAST || "",
      HOME_TEL: student.HOME_TEL || "",
      ADDRESS: student.ADDRESS || "",
      CITY: student.CITY || "",
      STATE: student.STATE || "",
      ZIP: student.ZIP || "",
      student_tel: student.student_tel || "",
      Email_student: student.Email_student || "",
      BRTHD: student.BRTHD ? format(new Date(student.BRTHD), "yyyy-MM-dd") : "",
      AGE: student.AGE || 0,
      GradeLevel: student.GradeLevel || "",
      APPLYING_FOR: student.APPLYING_FOR || "",
      LEVEL: student.LEVEL || "",
      Approach: student.Approach || "",
      E_mail_main: student.E_mail_main || "",
      E_NAME: student.E_NAME || "",
      E_TEL: student.E_TEL || "",
      CCPayment: student.CCPayment || "",
      ProgCode: student.ProgCode || "",
      BUDDY: student.BUDDY || "",
      WComment: student.WComment || "",
      DateFeePaid: student.DateFeePaid || "",
      PaymentStatus: student.PaymentStatus || "",
      AcceptedTerms: student.AcceptedTerms || "",
      AppType: student.AppType || 0,
      Employer: student.Employer || "",
      C_TEL: student.C_TEL || "",
      Occupation: student.Occupation || "",
      W_TEL: student.W_TEL || "",
      AGE_GROUP: student.AGE_GROUP || 0,
      AGRESSIVENESS: student.AGRESSIVENESS || "",
      GENDER: student.GENDER || "",
      FeeComment: student.FeeComment || "",
      DAY: student.DAY || "",
      StartTime: student.StartTime || "",
      EndTime: student.EndTime || "",
      classID: student.classID || null,
      meetingPoint: student.meetingPoint || null,
      meetColor: student.meetColor || "",
      status: student.status || "",
      updateAt: student.updateAt ? format(new Date(student.updateAt), "yyyy-MM-dd") : "",
      createAt: student.createAt ? format(new Date(student.createAt), "yyyy-MM-dd") : "",
    }));

    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <WaitlistClient data={formattedWaitlist} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading waitlist:', error);
    return <div>Error loading waitlist data.</div>;
  }
};

export default WaitlistPage;
