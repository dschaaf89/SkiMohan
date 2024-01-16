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
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import html2canvas from 'html2canvas';
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

    // Filter data based on the selected day (which now includes the time of day)
    const filtered = data.filter(item => item.DAY === selected);

    setFilteredData(filtered);
};
  // const handleDayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //   const selected = event.target.value;
  //   setSelectedDay(selected);
  
  //   let filtered: ClassColumn[] = []; // Explicitly declare 'filtered' as an array of ClassColumn
  
  //   if (selected.includes("Saturday") || selected.includes("Sunday")) {
  //     const timeSlot = selected.includes("Morning") ? "Morning" : "Afternoon";
  //     filtered = data.filter(item => 
  //       progCodeTimeSlots[item.progCode] === timeSlot && item.DAY === selected.split(" ")[0]);
  //   } else {
  //     filtered = data.filter(item => item.DAY === selected);
  //   }
  
  //   setFilteredData(filtered);
  // };

  const handleExportToPDF = async () => {
    // Filter based on the selected day
    const exportData = [...filteredData]; // Create a copy of filteredData
    console.log(exportData);
    // Sort the data
    exportData.sort((a, b) => {
      if (a.meetingPoint !== b.meetingPoint) {
          return a.meetingPoint - b.meetingPoint;
      }
      // Secondary sort by AGE if meetingPoint is the same
      return a.Age - b.Age;
  });

    console.log("Selected Day for Export:", selectedDay);
    console.log("Data to be Exported:", exportData);

    const doc = new jsPDF({
      orientation: "landscape",
    });
    const title = selectedDay ? `List of Classes for ${selectedDay}` : "List of All Classes";
    const titleX = 15; // X coordinate for the title, adjust as needed
    const titleY = 10; // 
    doc.setFontSize(18); // Set font size
    doc.text(title, titleX, titleY);
    const columns = [
      { title: "Sign#", dataKey: "meetingPoint" },
      {title:"meetColor", dataKey:"meetColor"},
      { title: "#ofStudents", dataKey: "numberStudents" },
      { title: "Discipline", dataKey: "discipline" },
      { title: "Ability", dataKey: "Level" },
      { title: "Age", dataKey: "Age" },
      { title: "ClassId", dataKey: "classId" },
      { title: "Instructor", dataKey: "instructorName" },
      { title: "Phone", dataKey: "instructorPhone" },
    
    ];
    const rows = exportData.map((classes) => ({
   
      meetingPoint: classes.meetingPoint,
      numberStudents: classes.numberStudents,
      discipline:classes.discipline,
      Level:classes.Level,
      Age: classes.Age,
      classId:classes.classId,
      instructorId:classes.instructorID,
      assistantId:classes.assistantId,
      meetColor:classes.meetColor,
      instructorPhone:classes.instructorPhone,  
      instructorName:classes.instructorName,    

    }));

    doc.autoTable({ columns: columns, body: rows });
    const fileName = selectedDay ? `${selectedDay.replace(" ", "_")}_classes.pdf` : "All_Classes.pdf";
    doc.save(fileName);
  };
  async function generatePayCardPDFs(classes: ClassColumn[]): Promise<void> {
    try {
      console.log("data sent to pdf",classes);
   
      console.log("data sent to pdf", classes);
      const response = await fetch( `/api/${params.seasonId}/classes/classCard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(classes),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "students.pdf";
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Error generating PDFs:", error);
    }
  }

  return(
    <>
    <div className=" flex items-center justify-between">
    <Heading
          title={`Classes (${filteredData.length})`}
          description="manage Classes for the season website"
        />
    </div>
    <div className="flex items-center">
    <Button
            className="mr-4"
            onClick={() => generatePayCardPDFs(filteredData)}
          >Export Pay Slips</Button>
    <Button className="mr-4" onClick={() => router.push(`/${params.seasonId}/classes/new`)}>
        <Plus className=" m-2 b-4 w-4"/>
        Add New
      </Button>
      <Button className="mr-4" onClick={handleExportToPDF}>
            <Plus className="mr-4 b-4 w-4" />
            Export classes
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
      </div>
    <Separator/>
    <DataTable searchKey="classId" columns={columns} data={filteredData}/>
    </>
  )
}