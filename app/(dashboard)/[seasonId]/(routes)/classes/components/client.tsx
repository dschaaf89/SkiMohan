"use client"

import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { ClassColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import axios from 'axios';

interface ClassClientProps {
  data: ClassColumn[];
}





export const ClassClient: React.FC<ClassClientProps> = ({
  data
}) => {
  const params = useParams();
  const router = useRouter();
  const seasonId = params.seasonId;
  const handleCreateClasses = async () => {
    console.log("Create Classes button clicked. Preparing to create classes.");

    try {
      const response = await axios.post(`/api/${params.seasonId}/createClasses`);
      console.log("Classes created successfully:", response.data);
      // You can also update the UI based on the response here
    } catch (error) {
      console.error('Error creating classes:', error);
      // Handle errors, such as displaying a notification to the user
    }
  };

  return(
    <>
    <div className=" flex items-center justify-between">
      <Heading
      title = {`Classes (${data.length})`}
      description="manage Classes for the season website"
      />
    </div>
    <Button onClick={() => router.push(`/${params.seasonId}/classes/new`)}>
        <Plus className=" m-2 b-4 w-4"/>
        Add New
      </Button>
    <Button onClick={handleCreateClasses} >Create Classes</Button>
    <Separator/>
    <DataTable searchKey="classId" columns={columns} data={data}/>
    </>
  )
}