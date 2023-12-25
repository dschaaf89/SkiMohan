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

interface ProgCodeTimeSlots {
  [progCode: string]: 'Morning' | 'Afternoon';
}

const saturdayProgCodeTimeSlots: ProgCodeTimeSlots = {
  // Saturday Morning Program Codes
  'G710-B-LO': 'Morning',
  'G710-S-LO': 'Morning',
  'G715-S-LO': 'Morning',

  // Saturday Afternoon Program Codes
  'G720-B-LO': 'Afternoon',
  'G720-S-LO': 'Afternoon',
  'G725-S-LO': 'Afternoon',
};

const sundayProgCodeTimeSlots: ProgCodeTimeSlots = {
  // Saturday Morning Program Codes
  'G110-B-LO': 'Morning',
  'G110-S-LO': 'Morning',
  'G115-S-LO': 'Morning',

  // Saturday Afternoon Program Codes
  'G120-B-LO': 'Afternoon',
  'G120-S-LO': 'Afternoon',
  'G125-S-LO': 'Afternoon',
};
const progCodeTimeSlots: ProgCodeTimeSlots = {
  ...saturdayProgCodeTimeSlots,
  ...sundayProgCodeTimeSlots,
  //
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
  
    let filtered;
    if (selected.includes("Saturday") || selected.includes("Sunday")) {
      // Saturday and Sunday with morning and afternoon sessions
      const timeSlot = selected.includes("Morning") ? "Morning" : "Afternoon";
      filtered = data.filter(item => 
        progCodeTimeSlots[item.progCode] === timeSlot && item.DAY === selected.split(" ")[0]);
    } else {
      // Other days with only one time slot
      filtered = data.filter(item => item.DAY === selected);
    }
  
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
        <option value="Saturday Morning">Saturday Morning</option>
        <option value="Saturday Afternoon">Saturday Afternoon</option>
        <option value="Sunday Morning">Sunday Morning</option>
        <option value="Sunday Afternoon">Sunday Afternoon</option>
      </select>
    <Separator/>
    <DataTable searchKey="classId" columns={columns} data={filteredData}/>
    </>
  )
}