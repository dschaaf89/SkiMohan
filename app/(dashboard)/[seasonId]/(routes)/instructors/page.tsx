import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { InstructorColumn } from "./components/columns";
import { InstructorClient } from "./components/client";

const InstructorPage = async ({
  params
}: {
  params: { seasonId: string }
}) => {
  const instructors = await prismadb.instructor.findMany({
    where: {
      seasonId: params.seasonId
    },
    include: {
      classTimes: {
        include: {
          classTime: true
        }
      },
      clinics: {
        include: {
          clinic: true
        }
      }
    }
  });

  const formattedInstructors: InstructorColumn[] = instructors.map((item) => ({

    UniqueID: item.UniqueID, 
    NAME_FIRST: item.NAME_FIRST || "",
    NAME_LAST: item.NAME_LAST || "",
    HOME_TEL: item.HOME_TEL || "",
    ADDRESS: item.ADDRESS || "",
    CITY: item.CITY || "",
    STATE: item.STATE || "",
    ZIP: item.ZIP || "",
    BRTHD: item.BRTHD ? format(new Date(item.BRTHD), "MM/dd/yyyy") : "",
    AGE: item.AGE, // Assuming this field is present in your document and corresponds to DOB
    E_mail_main: item.E_mail_main || "", // Assuming this field is present in your document
    STATUS: item.STATUS || "",
    COMMENTS: item.COMMENTS || "",
    prevYear: item.prevYear || "",
    dateReg: item.dateReg || "",
    emailCommunication: item.emailCommunication || false,
    InstructorType: item.InstructorType || "",
    PSIA: item.PSIA || "",
    updateAt: item.updateAt || new Date(),
    createAt: item.createAt || new Date(),
    AASI: item.AASI || "",
    testScore: item.testScore || "",
    ParentAuth: item.ParentAuth || false,
    OverNightLodge: item.OverNightLodge || false,
    ageRequestByStaff: Array.isArray(item.ageRequestByStaff)
      ? item.ageRequestByStaff.filter((v): v is string => typeof v === 'string')
      : null,
    clinics: item.clinics
      ? item.clinics.map(clinic => clinic.clinic ? clinic.clinic.name : "") // Create an array of clinic names
      : [],
    clinicInstructor: item.clinicInstructor || false,
    Supervisor: item.Supervisor || false,
    classTimeIds: item.classTimes
      ? item.classTimes
          .map(ct => ct.classTime ? ct.classTime.id : null) // Use optional chaining
          .filter((id): id is number => id !== null) // Filter out null values
      : [],
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <InstructorClient data={formattedInstructors} />
      </div>
    </div>
  );
};

export default InstructorPage;
