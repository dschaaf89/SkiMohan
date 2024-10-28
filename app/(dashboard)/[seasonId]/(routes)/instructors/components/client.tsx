"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { InstructorColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import axios from "axios";
import { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface InstuctorClientProps {
  data: InstructorColumn[];
}

type ClassTime = {
  id: number; // Unique identifier for the class time
  day: string; // Day of the week, e.g., "Monday", "Tuesday"
  startTime: string; // Class start time, e.g., "10:00 AM"
  endTime: string; // Class end time, e.g., "12:00 PM"
  location: string; // Location of the class, e.g., "Room 101"
  instructor: string; // Name of the instructor teaching this class
  maxStudents: number; // Maximum number of students allowed in the class
  registeredStudents: number; // Number of students currently registered
  waitlist: string[]; // List of students on the waitlist, if any
  description: string; // Description of the class
  isRecurring: boolean; // Whether the class is recurring or a one-time event
};

type InstructorClassTime = {
  id: number; // Unique identifier for the instructor-class relationship
  classTime: ClassTime; // ClassTime object containing details about the class
  instructorId: string; // Unique ID of the instructor
  dateAssigned: Date; // Date when the instructor was assigned to this class
  status: string; // Status of the assignment, e.g., "Confirmed", "Pending"
  feedback: string; // Any feedback provided by the instructor or students
  isPrimaryInstructor: boolean; // Whether this instructor is the primary instructor for this class
  additionalNotes: string; // Any additional notes about this assignment
};

type ExportDataItem = {
  instructorName: string; // Full name of the instructor
  classId: string | number; // ID of the class
  instructorType: string; // Type of instructor, e.g., "Lead", "Assistant"
  meetingPoint: string | number; // Where the class or group meets, e.g., "Entrance A"
  meetColor: string; // Color associated with the meeting point or group
  DAY: string; // Day and session description, e.g., "Saturday Morning"
  startTime: string; // Class start time, e.g., "10:00 AM"
  endTime: string; // Class end time, e.g., "12:00 PM"
  location: string; // Location of the class, e.g., "Room 101"
  numberStudents: number; // Number of students enrolled in the class
  level: string; // Level of the class, e.g., "Beginner", "Intermediate"
  ageGroup: string; // Age group of students, e.g., "Adults", "Teens"
  feedback: string; // Any feedback provided by the instructor or students
  notes: string; // Additional notes about the class or instructor
};

interface CellData {
  column: {
    dataKey: string;
  };
  cell: {
    section: string;
    x: number;
    y: number;
    height: number;
    text: string[];
  };
}

interface WillDrawCellData {
  column: {
    dataKey: string;
  };
  cell: {
    section: string;
  };
}

interface DidParseCellData {
  cell: {
    raw: any; // The raw value of the cell
    section: string; // 'head', 'body', or 'foot'
    x: number; // The x position of the cell
    y: number; // The y position of the cell
    height: number; // The height of the cell
    text: string[]; // The text content of the cell
  };
  column: {
    dataKey: string;
  };
  row: {
    index: number; // The index of the row
  };
}

export const InstructorClient: React.FC<InstuctorClientProps> = ({
  data,
}) => {
  const params = useParams();
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<string | null>(null); // State for the selected day
  const [filteredData, setFilteredData] = useState<InstructorColumn[]>(data); // State for filtered data
  const seasonId = params.seasonId;

  const handleDayChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedDay = event.target.value;
    setSelectedDay(selectedDay);

    try {
      // Send POST request to your API endpoint
      const response = await axios.post(
        `/api/${params.seasonId}/instructors/instructorClasses`,
        {
          selectedDay: selectedDay,
          seasonId: params.seasonId,
        }
      );

      if (!response.data) {
        throw new Error("Failed to fetch data");
      }

      // Process the data as needed
      setFilteredData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

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
              `/api/${params.seasonId}/instructors/importInstructors`,
              jsonData
            );
            console.log("Server Response:", response.data);
            // Handle the successful response here
            router.refresh();
            router.push(`/${params.seasonId}/instructors`);
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

  const handleExportStaffCheckinToPDF = async () => {
    console.log("Export Staff Check-in to PDF called");

    if (!filteredData || filteredData.length === 0) {
      console.error("No data available to export.");
      return;
    }

    const exportData: ExportDataItem[] = [];
    filteredData.forEach((instructor) => {
      let classesForSelectedDay = [];

      if (selectedDay === "Saturday" || selectedDay === "Sunday") {
        // Include all classes for Saturday or Sunday
        classesForSelectedDay =
          instructor.classes?.filter((classItem) =>
            classItem.day.includes(selectedDay)
          ) || [];
      } else {
        // For other days, match the exact day
        classesForSelectedDay =
          instructor.classes?.filter(
            (classItem) => classItem.day === selectedDay
          ) || [];
      }

      if (classesForSelectedDay.length > 0) {
        classesForSelectedDay.forEach((classItem) => {
          exportData.push({
            instructorName: instructor.NAME_LAST + " " + instructor.NAME_FIRST,
            instructorType: instructor.InstructorType,
            classId: classItem.classId,
            meetingPoint: classItem.meetingPoint,
            meetColor: classItem.meetColor,
            DAY: classItem.startTime,
            startTime: classItem.startTime,
            endTime: classItem.endTime,
            location: classItem.location,
            numberStudents: classItem.numberStudents,
            level: classItem.Level,
            ageGroup: classItem.Age.toString(),
            feedback: "",
            notes: "",
          });
        });
      } else {
        console.log(
          `Instructor Class Times for ${instructor.NAME_FIRST} ${instructor.NAME_LAST}:`,
          instructor.instructorClassTimes
        );
        // Instructor has no class assigned for the selected day
        const sessionSignUps =
          instructor.instructorClassTimes?.filter((ict) => {
            // Debugging log for each classTime
            console.log(`Class Time for ${ict.classTime.day}:`, ict.classTime);
            return selectedDay ? ict.classTime.day.includes(selectedDay) : false;
          }) || [];

        console.log(`Session Sign Ups for ${selectedDay}:`, sessionSignUps);

        const sessionDescriptions = sessionSignUps.map((ict) => {
          // Determine if the session is in the morning or afternoon based on start time
          const session = ict.classTime.startTime.includes("AM")
            ? "Morning"
            : "Afternoon";
          return `${selectedDay} ${session}`;
        });

        const dayDescription =
          sessionDescriptions.length > 0
            ? sessionDescriptions.join(" & ")
            : `${selectedDay} -`;

        exportData.push({
          instructorName: instructor.NAME_LAST + " " + instructor.NAME_FIRST,
          classId: "-",
          instructorType: instructor.InstructorType,
          meetingPoint: "-",
          meetColor: "-",
          DAY: dayDescription, // This will now say "Saturday Morning", "Saturday Afternoon", or both
          startTime: "",
          endTime: "",
          location: "",
          numberStudents: 0,
          level: "",
          ageGroup: "",
          feedback: "",
          notes: "",
        });
      }
    });

    // Sort the data by instructor name
    exportData.sort((a, b) => {
      // First, sort by instructor name
      const nameCompare = a.instructorName.localeCompare(b.instructorName);
      if (nameCompare !== 0) {
        return nameCompare;
      }

      // If names are the same, then sort by start time
      // Convert start times to a comparable format (24-hour format)
      const getComparableTime = (timeString: string) => {
        const [time, modifier] = timeString.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (modifier === "PM" && hours !== 12) {
          hours += 12;
        }
        if (modifier === "AM" && hours === 12) {
          hours = 0;
        }
        return hours * 60 + minutes; // convert to minutes for easy comparison
      };

      const aTime = getComparableTime(a.DAY);
      const bTime = getComparableTime(b.DAY);

      return aTime - bTime;
    });

    // Initialize jsPDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter",
    });

    // Define the header title and subheader information
    const headerTitle = "Check-In Sheet for " + selectedDay + " Week 7";
    doc.setFontSize(16);
    doc.text(headerTitle, 14, 22);
    doc.setFontSize(12);

    // Define the columns for the autoTable
    const columns = [
      { title: "", dataKey: "checkbox" },
      { title: "Instructor Name", dataKey: "instructorName" },
      { title: "Class ID", dataKey: "classId" },
      { title: "Instructor Type", dataKey: "instructorType" },
      { title: "Sign#", dataKey: "meetingPoint" },
      { title: "Sign Color", dataKey: "meetColor" },
      { title: "DAY/Session", dataKey: "DAY" },
      // ... other columns as needed
    ];

    // Map the exportData to rows for the autoTable
    const rows = exportData.map((instructor) => ({
      checkbox: "", // Placeholder for the checkbox
      instructorName: instructor.instructorName,
      classId: instructor.classId,
      instructorType: instructor.instructorType,
      meetingPoint: instructor.meetingPoint,
      meetColor: instructor.meetColor,
      DAY: instructor.DAY,
      // ... other data mappings
    }));

    // Generate the autoTable
    doc.autoTable({
      columns: columns,
      body: rows,
      didParseCell: function (data: CellData) {
        if (data.cell.section === "body" && data.column.dataKey === "checkbox") {
          const midPointY = data.cell.y + data.cell.height / 2;
          const checkBoxX = data.cell.x + 2;
          const checkBoxY = midPointY - 3;
          doc.rect(checkBoxX, checkBoxY, 6, 6);
          data.cell.text = [];
        }
      },
      willDrawCell: function (data: CellData) {
        if (data.column.dataKey === "checkbox" && data.cell.section === "body") {
          return false;
        }
      },
    });

    // Save the generated PDF
    const fileName = `Check-In_Sheet_for_${selectedDay!.replace(
      /\s+/g,
      "_"
    )}.pdf`;
    doc.save(fileName);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Instructors (${data.length})`}
          description="Manage instructors"
        />

        <div className="flex items-center">
          <Button className="mr-4" onClick={handleExportStaffCheckinToPDF}>
            <Plus className="mr-4 b-4 w-4" />
            Export staffCheckIn
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
            <Plus className="mr-2 b-4 w-4" />
            Import instructors
          </Button>

          <Button
            onClick={() => router.push(`/${params.seasonId}/instructors/new`)}
          >
            <Plus className="m-2 b-4 w-4" />
            Add New
          </Button>
        </div>
      </div>

      <Separator />
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
        <option value="Saturday">Saturday</option>
        <option value="Sunday">Sunday</option>
      </select>
      <DataTable searchKeys={["NAME_LAST"]} columns={columns} data={filteredData} />
    </>
  );
};
