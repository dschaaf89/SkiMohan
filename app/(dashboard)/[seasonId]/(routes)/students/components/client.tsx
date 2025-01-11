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
  "G710-B-LO": "Morning",
  "G710-S-LO": "Morning",
  "G715-S-LO": "Morning",
  "G720-B-LO": "Afternoon",
  "G720-S-LO": "Afternoon",
  "G725-S-LO": "Afternoon",
};

const sundayProgCodeTimeSlots: ProgCodeTimeSlots = {
  "G110-B-LO": "Morning",
  "G110-S-LO": "Morning",
  "G115-S-LO": "Morning",
  "G120-B-LO": "Afternoon",
  "G120-S-LO": "Afternoon",
  "G125-S-LO": "Afternoon",
};

const progCodeTimeSlots: ProgCodeTimeSlots = {
  ...saturdayProgCodeTimeSlots,
  ...sundayProgCodeTimeSlots,
};

export const StudentClient: React.FC<StudentClientProps> = ({ data }) => {
  const params = useParams();
  const router = useRouter();
  const seasonId = params.seasonId;

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<StudentColumn[]>(data);

  const filteredDataForResort = filteredData.filter(
    (student) =>
      student.status.toLowerCase() !== "waitlist" &&
      student.APPLYING_FOR.toLowerCase() !== "transportation"
  );
// Function to delete all classes and resort students
const handleResortClasses = async () => {
  try {
    console.log("Deleting all classes for season:", seasonId);
    const deleteResponse = await axios.delete(`/api/${seasonId}/deleteClasses`);
    console.log("Delete response:", deleteResponse.data);

    console.log("Preparing data for createClasses request:");
    console.log("filteredDataForResort:", filteredDataForResort); // Log to check data being sent

    // Filter students to identify ones without APPLYING_FOR field
    const invalidStudents = filteredDataForResort.filter(
      (student) => !student.APPLYING_FOR || student.APPLYING_FOR.trim() === ""
    );

    // Log invalid students
    if (invalidStudents.length > 0) {
      console.warn("The following students are missing 'APPLYING_FOR' and were not processed:", invalidStudents);
    }

    // Filter out students with valid APPLYING_FOR
    const validStudents = filteredDataForResort.filter(
      (student) => student.APPLYING_FOR && student.APPLYING_FOR.trim() !== ""
    );

    // Map data for valid students, including seasonId in each entry
    const requestData = {
      seasonId, // Pass seasonId in the top-level object
      students: validStudents.map((student) => ({
        UniqueID: student.UniqueID,
        NAME_FIRST: student.NAME_FIRST,
        NAME_LAST: student.NAME_LAST,
        HOME_TEL: student.HOME_TEL,
        ADDRESS: student.ADDRESS,
        CITY: student.CITY,
        STATE: student.STATE,
        ZIP: student.ZIP,
        student_tel: student.student_tel,
        Email_student: student.Email_student,
        BRTHD: student.BRTHD,
        GradeLevel: student.GradeLevel,
        APPLYING_FOR: student.APPLYING_FOR,
        LEVEL: student.LEVEL,
        Approach: student.Approach,
        E_mail_main: student.E_mail_main,
        E_NAME: student.E_NAME,
        E_TEL: student.E_TEL,
        CCPayment: student.CCPayment,
        ProgCode: student.ProgCode,
        BUDDY: student.BUDDY,
        WComment: student.WComment,
        DateFeePaid: student.DateFeePaid,
        PaymentStatus: student.PaymentStatus,
        AcceptedTerms: student.AcceptedTerms,
        AppType: student.AppType,
        Employer: student.Employer,
        C_TEL: student.C_TEL,
        Occupation: student.Occupation,
        W_TEL: student.W_TEL,
        AGE: student.AGE,
        AGRESSIVENESS: student.AGRESSIVENESS,
        AGE_GROUP: student.AGE_GROUP,
        GENDER: student.GENDER,
        FeeComment: student.FeeComment,
        DAY: student.DAY,
        StartTime: student.StartTime,
        EndTime: student.EndTime,
      })),
    };

    console.log("Sending request to create new classes with data:", requestData);

    const createResponse = await axios.post(`/api/${seasonId}/createClasses`, requestData);
    console.log("Create response:", createResponse.data);

    router.refresh();
    alert("Classes have been resorted for the season");

  } catch (error) {
    console.error("Error resorting classes:", error);
    alert("Error resorting classes. Please try again.");
  }
};


  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = async (e) => {
        if (e.target && e.target.result) {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          try {
            const response = await axios.post(
              `/api/${params.seasonId}/students/importStudents`,
              jsonData
            );
            console.log("Server Response:", response.data);
            router.refresh();
          } catch (error) {
            console.error("Error posting data:", error);
          }
        }
      };

      reader.readAsBinaryString(file);
    }
  };

  const handleDayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    setSelectedDay(selected);

    let filtered;
    if (selected.includes("Saturday") || selected.includes("Sunday")) {
      const timeSlot = selected.includes("Morning") ? "Morning" : "Afternoon";
      filtered = data.filter(
        (item) =>
          progCodeTimeSlots[item.ProgCode] === timeSlot &&
          item.DAY === selected.split(" ")[0]
      );
    } else {
      filtered = data.filter((item) => item.DAY === selected);
    }

    setFilteredData(filtered);
  };

  async function generateStudentPDFs(students: StudentColumn[]): Promise<void> {
    try {
      const filteredStudents = students.filter(
        (student) => student.status !== "Unregistered" && student.APPLYING_FOR !== "Transportation"
      );
      const response = await fetch(`/api/${params.seasonId}/students/studentCard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filteredStudents),
      });

      if (!response.ok) throw new Error(`Error: ${response.statusText}`);

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
    // Filter data based on the current season
    const exportData = filteredData
      .filter(
        (student) =>
          student.APPLYING_FOR !== "Transportation" &&
        student.APPLYING_FOR !== "TRANSPORTATION ONLY" &&
          student.status !== "Unregistered" &&
          student.status !== "Waitlist" &&
          seasonId === seasonId // Ensure it matches the current seasonId
      )
      .sort((a, b) =>
        a.NAME_LAST.trim().toUpperCase().localeCompare(b.NAME_LAST.trim().toUpperCase())
      );
  
    const doc = new jsPDF({ orientation: "portrait" });
    const title = "List of All Students";
    const titleX = 12;
    const titleY = 8;
    doc.setFontSize(10);
    doc.text(title, titleX, titleY);
  
    const columns = [
      { title: "SeasonID", dataKey: "SeasonID" },
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
      phone: student.HOME_TEL,
    }));
  
    doc.autoTable({ columns: columns, body: rows, styles: { fontSize: 8 } });
    const fileName = selectedDay
      ? `${selectedDay.replace(" ", "_")}_Students.pdf`
      : "All_Students.pdf";
    doc.save(fileName);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Students (${filteredData.length})`}
          description="Manage students for the season website"
        />
        <div className="flex items-center">
          <Button className="mr-4" onClick={() => generateStudentPDFs(filteredData)}>
            <Plus className="mr-4 b-4 w-4" />
            Export Student cards
          </Button>
          <Button className="mr-2" onClick={handleExportToPDF}>
            <Plus className="mr-4 b-4 w-4" />
            Export Students
          </Button>
          {/* <Button onClick={() => document.getElementById("fileInput")!.click()} className="mr-4">
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              onChange={handleFileInputChange}
              accept=".xlsx, .xls"
            />
            <Plus className=" mr-2 b-4 w-4" />
            Import Students
          </Button> */}
          <Button onClick={() => router.push(`/${params.seasonId}/students/new`)}>
            <Plus className=" m-2 b-4 w-4" />
            Add New
          </Button>
          {/* <Button onClick={handleResortClasses} className="ml-4">
            <Plus className=" mr-2 b-4 w-4" />
            Resort Classes
          </Button> */}
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
      <DataTable searchKeys={['ProgCode', 'NAME_LAST']} columns={columns} data={filteredData} />
      <Separator />
      <ApiList entityName="students" entityIdName="studentId" />
    </>
  );
};
