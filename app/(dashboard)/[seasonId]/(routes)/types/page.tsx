import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { TypeColumn } from "./components/columns";
import { TypeClient } from "./components/client";

const TypePage = async ({
  params
}: {
  params: { seasonId: string }
}) => {
  const types = await prismadb.type.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedTypes: TypeColumn[] = types.map((item) => ({
    id: item.id,
    name: item.name,
    value: item.value,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <TypeClient data={formattedTypes} />
      </div>
    </div>
  );
};

export default TypePage;