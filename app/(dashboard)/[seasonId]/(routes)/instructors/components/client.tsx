"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { InstructorColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Helper function to convert time to minutes for sorting
const timeToMinutes = (time: string): number => {
  const [hour, minute] = time.split(":").map(Number);
  const isPM = time.includes("PM");
  return hour % 12 * 60 + minute + (isPM ? 720 : 0); // Convert to 24-hour format in minutes
};

interface InstructorClientProps {
  data: InstructorColumn[];
  classes: any[]; // Replace `any[]` with your actual class type if available
}

export const InstructorClient: React.FC<InstructorClientProps> = ({
  data,
  classes,
}) => {
  const params = useParams();
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<InstructorColumn[]>(data);

  // Handle filtering instructors by selected day
  const handleDayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDay = event.target.value;
    setSelectedDay(selectedDay);

    // Filter the classes for the selected day
    const filteredClasses = classes.filter(
      (classItem) => classItem.day === selectedDay
    );

    // Update filtered data with the instructors who have classes on the selected day
    const instructorsWithClasses = data.filter((instructor) =>
      filteredClasses.some(
        (classItem) => classItem.instructorId === instructor.UniqueID
      )
    );

    setFilteredData(instructorsWithClasses);
  };

  // Handle importing instructors from Excel
  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = async (e) => {
        if (e.target && e.target.result) {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: "binary" });

          // Assume first sheet
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          try {
            const response = await fetch(
              `/api/${params.seasonId}/instructors/importInstructors`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(jsonData),
              }
            );
            if (response.ok) {
              console.log("Instructors imported successfully.");
              router.refresh();
            } else {
              console.error("Failed to import instructors.");
            }
          } catch (error) {
            console.error("Error importing instructors:", error);
          }
        }
      };

      reader.readAsBinaryString(file);
    }
  };

  // Handle exporting data to PDF
// Handle exporting data to PDF
const handleExportStaffCheckinToPDF = async () => {
  console.log("Export Staff Check-in to PDF called");

  if (!filteredData || filteredData.length === 0) {
    console.error("No data available to export.");
    return;
  }

  const exportData: any[] = [];

  // Build export data for instructors
  data.forEach((instructor) => {
    // Check if the instructor is signed up to teach on the selected day
    const isTeachingThatDay = classes.some(
      (classItem) =>
        classItem.instructorId === instructor.UniqueID &&
        classItem.day === selectedDay
    );

    if (isTeachingThatDay) {
      const instructorClasses = classes.filter(
        (classItem) =>
          classItem.instructorId === instructor.UniqueID &&
          classItem.day === selectedDay
      );

      if (instructorClasses.length > 0) {
        instructorClasses.forEach((classItem) => {
          exportData.push({
            instructorName: `${instructor.NAME_LAST} ${instructor.NAME_FIRST}`,
            classId: classItem.classId.toString(),
            instructorType: instructor.InstructorType || "Unknown",
            meetingPoint: classItem.meetingPoint || "-",
            meetColor: classItem.meetColor || "-",
            DAY: selectedDay || "-",
            session: classItem.startTime || "N/A", // Use class start time for the "Session"
          });
        });
      } else {
        // Add instructor without class details
        exportData.push({
          instructorName: `${instructor.NAME_LAST} ${instructor.NAME_FIRST}`,
          classId: "-", // No class ID
          instructorType: instructor.InstructorType || "Unknown",
          meetingPoint: "-", // No meeting point
          meetColor: "-", // No meeting color
          DAY: `${selectedDay || "N/A"} -`, // Selected day
          session: "N/A", // No session
        });
      }
    }
  });

  // Sort export data by session (startTime) and then by meetingPoint
  exportData.sort((a, b) => {
    const timeA = a.session === "N/A" ? Infinity : timeToMinutes(a.session);
    const timeB = b.session === "N/A" ? Infinity : timeToMinutes(b.session);

    if (timeA === timeB) {
      return (a.meetingPoint || 0) - (b.meetingPoint || 0); // Sort by meetingPoint if times are the same
    }

    return timeA - timeB; // Sort by session time
  });

  // Generate PDF
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  // Add the centered header title
  const headerTitle = `Check-In Sheet for ${selectedDay || "N/A"} Week 1`;
  doc.setFontSize(16);
  const pageWidth = doc.internal.pageSize.getWidth();
  const textWidth = doc.getTextWidth(headerTitle);
  const textX = (pageWidth - textWidth) / 2; // Center the text
  doc.text(headerTitle, textX, 22);

  // Define the table headers
  const columns = [
    { title: "Instructor Name", dataKey: "instructorName" },
    { title: "Class ID", dataKey: "classId" },
    { title: "Instructor Type", dataKey: "instructorType" },
    { title: "Sign#", dataKey: "meetingPoint" },
    { title: "Sign Color", dataKey: "meetColor" },
    { title: "DAY/Session", dataKey: "DAY" },
    { title: "Session", dataKey: "session" },
  ];

  // Map the export data to rows
  const rows = exportData.map((data) => ({
    instructorName: data.instructorName,
    classId: data.classId,
    instructorType: data.instructorType,
    meetingPoint: data.meetingPoint,
    meetColor: data.meetColor,
    DAY: data.DAY,
    session: data.session,
  }));

  doc.autoTable({
    columns: columns,
    body: rows,
    theme: "grid",
    styles: { fontSize: 10 },
    headStyles: { fillColor: [22, 160, 133] },
  });

  const fileName = `Check-In_Sheet_for_${selectedDay?.replace(/\s+/g, "_") || "N/A"}.pdf`;
  doc.save(fileName);
};


  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Instructors (${filteredData.length})`}
          description="Manage instructors"
        />

        <div className="flex items-center">
          <Button
            onClick={() => document.getElementById("fileInput")?.click()}
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
            Import
          </Button>
          <Button
            onClick={() => router.push(`/${params.seasonId}/instructors/new`)}
            className="mr-4"
          >
            <Plus className="mr-2 b-4 w-4" />
            Add New
          </Button>
          <Button className="mr-4" onClick={handleExportStaffCheckinToPDF}>
            <Plus className="mr-4 b-4 w-4" />
            Export Staff Check-In
          </Button>
        </div>
      </div>

      <Separator />

      <select
        value={selectedDay || ""}
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
