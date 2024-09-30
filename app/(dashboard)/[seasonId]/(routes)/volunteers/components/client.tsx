"use client"

import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"

import { VolunteerColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";


interface VolunteerClientProps {
  data: VolunteerColumn[];
}


export const VolunteerClient: React.FC<VolunteerClientProps> = ({
  data
}) => {
  const params = useParams();
  const router = useRouter();

  return(
    <>
    <div className=" flex items-center justify-between">
      <Heading
      title = {`volunteers (${data.length})`}
      description="manage volunteers for the season website"
      />
      <Button onClick={() => router.push(`/${params.seasonId}/volunteers/new`)}>
        <Plus className=" mr-2 b-4 w-4"/>
        Add New
      </Button>
    </div>
    <Separator/>
    <DataTable searchKeys={["NAME_LAST"]} columns={columns} data={data}/>
    
      
    </>
  )
}