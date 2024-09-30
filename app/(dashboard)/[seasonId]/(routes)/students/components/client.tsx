"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { StudentColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import axios from "axios";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useState } from "react";
import { ApiList } from "@/components/ui/api-list";
interface StudentClientProps {
  data: StudentColumn[];
}
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}
interface ProgCodeTimeSlots {
  [progCode: string]: "Morning" | "Afternoon";
}

const saturdayProgCodeTimeSlots: ProgCodeTimeSlots = {
  // Saturday Morning Program Codes
  "G710-B-LO": "Morning",
  "G710-S-LO": "Morning",
  "G715-S-LO": "Morning",

  // Saturday Afternoon Program Codes
  "G720-B-LO": "Afternoon",
  "G720-S-LO": "Afternoon",
  "G725-S-LO": "Afternoon",
};

const sundayProgCodeTimeSlots: ProgCodeTimeSlots = {
  // Saturday Morning Program Codes
  "G110-B-LO": "Morning",
  "G110-S-LO": "Morning",
  "G115-S-LO": "Morning",

  // Saturday Afternoon Program Codes
  "G120-B-LO": "Afternoon",
  "G120-S-LO": "Afternoon",
  "G125-S-LO": "Afternoon",
};
const progCodeTimeSlots: ProgCodeTimeSlots = {
  ...saturdayProgCodeTimeSlots,
  ...sundayProgCodeTimeSlots,
  //
};

export const StudentClient: React.FC<StudentClientProps> = ({ data }) => {
  const params = useParams();
  const router = useRouter();
  const seasonId = params.seasonId;

  const [selectedDay, setSelectedDay] = useState<string | null>(null); // State for the selected day
  const [filteredData, setFilteredData] = useState<StudentColumn[]>(data); // State for filtered data

  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = async (e) => {
        // Ensure that the result is not null
        if (e.target && e.target.result) {
          const data = e.target.result;
          const workbook = XLSX.read(data, {
            type: "binary",
          });

          // Assuming your Excel file has a sheet named "Sheet1"
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];

          // Convert the sheet to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          });

          // Log the JSON object to inspect it
          console.log(jsonData);

          // Use axios to send this JSON data to your server
          try {
            const response = await axios.post(
              `/api/${params.seasonId}/students/importStudents`,
              jsonData
            );
            console.log("Server Response:", response.data);
            // Handle the successful response here
            router.refresh();
            router.push(`/${params.seasonId}/students`);
          } catch (error) {
            console.error("Error posting data:", error);
            // Handle the error here
          }
        } else {
          console.error("File read error");
        }
      };

      reader.onerror = (error) => {
        console.error("FileReader error:", error);
      };

      reader.readAsBinaryString(file);
    }
  };

  const handleDayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    setSelectedDay(selected);

    let filtered;
    if (selected.includes("Saturday") || selected.includes("Sunday")) {
      // Saturday and Sunday with morning and afternoon sessions
      const timeSlot = selected.includes("Morning") ? "Morning" : "Afternoon";
      filtered = data.filter(
        (item) =>
          progCodeTimeSlots[item.ProgCode] === timeSlot &&
          item.DAY === selected.split(" ")[0]
      );
    } else {
      // Other days with only one time slot
      filtered = data.filter((item) => item.DAY === selected);
    }

    setFilteredData(filtered);
  };
  async function generateStudentPDFs(students: StudentColumn[]): Promise<void> {
    try {
      console.log("data sent to pdf",students);
      const filteredStudents = students.filter(student => 
        student.status !== "Unregistered" &&  
        student.APPLYING_FOR !== "Transportation"
      );
      console.log("data sent to pdf", filteredStudents);
      const response = await fetch( `/api/${params.seasonId}/students/studentCard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filteredStudents),
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
  const handleExportToPDF = async () => {
    const exportData = filteredData
      .filter((student) => student.APPLYING_FOR !== "Transportation" && student.status !== "Unregistered")
        .sort((a, b) => a.NAME_LAST.trim().toUpperCase().localeCompare(b.NAME_LAST.trim().toUpperCase()));
      const doc = new jsPDF({
      orientation: "portrait",
    });
    const title = "List of All Students"; // Your title
    const titleX = 12; // X coordinate for the title, adjust as needed
    const titleY = 8; //
    doc.setFontSize(10); // Set font size
    doc.text(title, titleX, titleY);
    const columns = [
      { title: "Last", dataKey: "NAME_LAST" },
      { title: "First", dataKey: "NAME_FIRST" },
      { title: "Day", dataKey: "Day" },
      { title: "Begin", dataKey: "StartTime" },
      { title: "Color", dataKey: "meetColor" },
      { title: "Sign#", dataKey: "meetingPoint" },
      { title: "Discipline", dataKey: "Applying_For" },
      { title: "Ability", dataKey: "level" },
      { title: "Program", dataKey: "ProgCode" },
      { title: "Age", dataKey: "AGE" },
      // { title: "Registered For", dataKey: "APPLYING_FOR" },
      { title: "Emergency", dataKey: "phone" },
    ];
    const rows = exportData.map((student) => ({
      NAME_LAST: student.NAME_LAST,
      NAME_FIRST: student.NAME_FIRST,
      Day: student.DAY,
      StartTime: student.StartTime,
      meetColor: student.meetColor,
      meetingPoint: student.meetingPoint,
      Applying_For: student.APPLYING_FOR,
      level: student.LEVEL,
      ProgCode: student.ProgCode,
      AGE: student.AGE,
      //APPLYING_FOR: student.APPLYING_FOR, // Note: This appears to be a duplicate of the "Applying_For" field
      phone: student.HOME_TEL,
    }));
    

    doc.autoTable({ columns: columns, body: rows,styles: { fontSize: 8 } });
    const fileName = selectedDay
      ? `${selectedDay.replace(" ", "_")}_Students.pdf`
      : "All_Students.pdf";
    doc.save(fileName);
  };

  return (
    <>
      <div className=" flex items-center justify-between">
        <Heading
          title={`Students (${filteredData.length})`}
          description="manage students for the season website"
        />
        <div className="flex items-center">
          <Button
            className="mr-4"
            onClick={() => generateStudentPDFs(filteredData)}
          >
            <Plus className="mr-4 b-4 w-4" />
            Export Student cards
          </Button>
          <Button className="mr-2" onClick={handleExportToPDF}>
            <Plus className="mr-4 b-4 w-4" />
            Export Students
          </Button>
          <Button
            onClick={() => document.getElementById("fileInput")!.click()}
            className="mr-4"
          >
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              onChange={handleFileInputChange}
              accept=".xlsx, .xls"
            />
            <Plus className=" mr-2 b-4 w-4" />
            Import Students
          </Button>

          <Button
            onClick={() => router.push(`/${params.seasonId}/students/new`)}
          >
            <Plus className=" m-2 b-4 w-4" />
            Add New
          </Button>
         
        </div>
      </div>

      <select
        value={selectedDay ?? ""}
        onChange={handleDayChange}
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

      <Separator />
      <DataTable searchKeys={['ProgCode', 'NAME_LAST']}  columns={columns} data={filteredData} />
      <Separator />
      <ApiList entityName="students" entityIdName="studentId" />
    </>
  );
};
