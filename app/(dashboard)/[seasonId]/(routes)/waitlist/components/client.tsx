"use client";

import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { columns, WaitlistColumn } from "./columns";

interface WaitlistClientProps {
  data: WaitlistColumn[];
}

export const WaitlistClient: React.FC<WaitlistClientProps> = ({
  data
}) => {
  return (
    <>
      <Heading title={`Waitlist (${data.length})`} description="Manage waitlist for your season" />
      <Separator />
      <DataTable searchKeys={["NAME_LAST"]}columns={columns} data={data} />
    </>
  );
};