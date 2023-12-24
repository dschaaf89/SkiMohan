"use client"

import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { ClassColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import axios from 'axios';
import { useState } from "react";

interface ClassClientProps {
  data: ClassColumn[];
}





export const ClassClient: React.FC<ClassClientProps> = ({
  data
}) => {
  const params = useParams();
  const router = useRouter();
  const seasonId = params.seasonId;
  const [selectedDay, setSelectedDay] = useState<string | null>(null); // State for the selected day
  const [filteredData, setFilteredData] = useState<ClassColumn[]>(data); // State for filtered data
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
  const handleDayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    setSelectedDay(selected);

    // Filter the data based on the selected day
    const filtered = data.filter((item) => item.DAY === selected);
    setFilteredData(filtered);
  };
  return(
    <>
    <div className=" flex items-center justify-between">
    <Heading
          title={`Classes (${filteredData.length})`}
          description="manage Classes for the season website"
        />
    </div>
    <Button onClick={() => router.push(`/${params.seasonId}/classes/new`)}>
        <Plus className=" m-2 b-4 w-4"/>
        Add New
      </Button>

    <Button onClick={handleCreateClasses} >Create Classes</Button>
    <select value={selectedDay ?? ''} onChange={handleDayChange}
        className="block w-40 p-2 border rounded-lg mt-4"
      >
        <option value="">Select Day</option>
        <option value="Monday">Monday</option>
        <option value="Tuesday">Tuesday</option>
        <option value="Wednesday">Wednesday</option>
        <option value="Thursday">Thursday</option>
        <option value="Friday">Friday</option>
        <option value="Saturday">Saturday</option>
        <option value="Sunday">Sunday</option>
      </select>
    <Separator/>
    <DataTable searchKey="classId" columns={columns} data={filteredData}/>
    </>
  )
}