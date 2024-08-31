import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { ProgramColumn } from "./components/columns";
import { ProgramClient } from "./components/client";

const ProgramsPage = async ({
  params
}: {
  params: { seasonId: string }
}) => {
  const programs = await prismadb.program.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedPrograms: ProgramColumn[] = programs.map((item) => ({
    id: item.id,
    name: item.name,
    imageUrl:item.imageUrl,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProgramClient data={formattedPrograms} />
      </div>
    </div>
  );
};

export default ProgramsPage;