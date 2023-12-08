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
  id:item.id,  
  UniqueID: item.UniqueID,
  NAME_FIRST: item.NAME_FIRST || "",
  NAME_LAST: item.NAME_LAST|| "",
  HOME_TEL: item.HOME_TEL|| "",
  ADDRESS: item.ADDRESS|| "",
  CITY: item.CITY|| "",
  STATE: item.STATE|| "",
  ZIP: item.ZIP|| "",
  BRTHD: item.BRTHD ? format(new Date(item.BRTHD), "MM/dd/yyyy") : "",
  AGE: item.AGE,// Assuming this field is present in your document and corresponds to DOB
  E_mail_main: item.E_mail_main|| "", // Assuming this field is present in your document
  GENDER: item.GENDER,
  updateAt:item.updateAt,
  createAt:item.createAt,
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