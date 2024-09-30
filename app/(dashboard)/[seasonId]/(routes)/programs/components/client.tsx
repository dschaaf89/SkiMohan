"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiAlert } from "@/components/ui/api-alert";

import { columns, ProgramColumn } from "./columns";
import { ApiList } from "@/components/ui/api-list";

interface ProgramClientProps {
  data: ProgramColumn[];
}

export const ProgramClient: React.FC<ProgramClientProps> = ({
  data
}) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Programs (${data.length})`} description="Manage Programs for your store" />
        <Button onClick={() => router.push(`/${params.seasonId}/programs/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKeys={["name"]} columns={columns} data={data} />
      <Heading title="API" description="API Calls for Categories" />
      <Separator />
      <ApiList entityName="programs" entityIdName="programId" />
    </>
  );
};