import prismadb from "@/lib/prismadb";

import { ProgramForm } from "./components/programs-form";

const ProgramPage = async ({
  params
}: {
  params: { programId: string, seasonId: string }
}) => {
  const program = await prismadb.program.findUnique({
    where: {
      id: params.programId
    }
  });



  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProgramForm initialData={program} />
      </div>
    </div>
  );
}

export default ProgramPage;