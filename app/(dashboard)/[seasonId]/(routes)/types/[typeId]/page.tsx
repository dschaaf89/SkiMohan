import prismadb from "@/lib/prismadb";

import { TypesForm } from "./components/types-form";

const SizePage = async ({
  params
}: {
  params: { typeId: string }
}) => {
  const size = await prismadb.type.findUnique({
    where: {
      id: params.typeId
    }
  });

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <TypesForm initialData={size} />
      </div>
    </div>
  );
}

export default SizePage;