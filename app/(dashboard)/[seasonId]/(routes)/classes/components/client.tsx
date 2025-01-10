"use client";

import { Phone, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ClassColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import axios from "axios";
import { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface Instructor {
  UniqueID: number;
  NAME_FIRST: string;
  NAME_LAST: string;
  HOME_TEL: string;
}

interface ClassClientProps {
  data: ClassColumn[];
  instructors: Instructor[];
}

export const ClassClient: React.FC<ClassClientProps> = ({ data, instructors }) => {
  const params = useParams();
  const router = useRouter();
  const seasonId = params.seasonId;
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<ClassColumn[]>(data);

  // Map instructors for quick lookup
  const instructorMap = instructors.reduce((map, instructor) => {
    map[instructor.UniqueID] = instructor;
    return map;
  }, {} as Record<number, Instructor>);

  const assignMeetingPoints = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post(`/api/${seasonId}/meetingPoint`, {
        seasonId,
        classes: filteredData,
      });

      if (response.status === 200) {
        setMessage("Meeting points assigned successfully!");
        router.refresh(); // Refresh the page to show updated data
      } else {
        setMessage("Failed to assign meeting points.");
      }
    } catch (error) {
      console.error("Error assigning meeting points:", error);
      setMessage("An error occurred while assigning meeting points.");
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    setSelectedDay(selected);

    let filtered: ClassColumn[] = [];

    if (selected.includes("Saturday") || selected.includes("Sunday")) {
      const isMorning = selected.includes("Morning");
      filtered = data.filter(
        (item) =>
          item.DAY === selected.split(" ")[0] &&
          ((isMorning && item.startTime < "12:00 PM") ||
            (!isMorning && item.startTime >= "12:00 PM"))
      );
    } else {
      filtered = data.filter((item) => item.DAY === selected);
    }

    setFilteredData(filtered);
    console.log(`Filtered Data for ${selected}:`, filtered); // Debugging logs
  };

  const handleExportToPDF = async () => {
    const exportData = [...filteredData].map((classes) => {
      const instructor = instructorMap[classes.instructorID];
      return {
        ...classes,
        instructorPhone: instructor?.HOME_TEL || "N/A", // Enrich with phone dynamically
      };
    });

    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(18);
    doc.text("Classes Report", 15, 10);

    const columns = [
      { title: "Meeting Point", dataKey: "meetingPoint" },
      { title: "Color", dataKey: "meetColor" },
      { title: "Students", dataKey: "numberStudents" },
      { title: "Discipline", dataKey: "discipline" },
      { title: "Level", dataKey: "Level" },
      { title: "Age", dataKey: "Age" },
      { title: "ClassId", dataKey: "classId" },
      { title: "Instructor Name", dataKey: "instructorName" },
      { title: "Phone", dataKey: "instructorPhone" },
    ];

    const rows = exportData.map((classes) => ({
      meetingPoint: classes.meetingPoint,
      meetColor: classes.meetColor,
      numberStudents: classes.numberStudents,
      discipline: classes.discipline,
      Level: classes.Level,
      Age: classes.Age,
      classId: classes.classId,
      instructorName: classes.instructorName,
      instructorPhone: classes.instructorPhone,
    }));

    doc.autoTable({ columns, body: rows });
    doc.save("Classes_Report.pdf");
  };

  const handleGenerateClassCards = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post(`/api/${seasonId}/classes/classCard`, filteredData, {
        responseType: "blob", // Ensure the response is treated as a binary file
      });

      if (response.status === 200) {
        // Create a URL for the blob and download the PDF
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `ClassCards_${selectedDay || "All"}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setMessage("Class cards generated successfully!");
      } else {
        setMessage("Failed to generate class cards.");
      }
    } catch (error) {
      console.error("Error generating class cards:", error);
      setMessage("An error occurred while generating class cards.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Classes (${filteredData.length})`}
          description="Manage Classes for the season website"
        />
      </div>
      <div className="flex items-center">
        <Button className="mr-4" onClick={assignMeetingPoints}>
          <Plus className="m-2 b-4 w-4" />
          Assign Meeting Points
        </Button>
        <Button
          className="mr-4"
          onClick={() => router.push(`/${params.seasonId}/classes/new`)}
        >
          <Plus className="m-2 b-4 w-4" />
          Add New
        </Button>
        <Button className="mr-4" onClick={handleExportToPDF}>
          <Plus className="mr-4 b-4 w-4" />
          Export Classes
        </Button>

        <Button className="mr-4" onClick={handleGenerateClassCards}>
          <Plus className="mr-4 b-4 w-4" />
          Generate Class Cards
        </Button>
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
      </div>
      <Separator />
      <DataTable searchKeys={["classId"]} columns={columns} data={filteredData} />
    </>
  );
};
