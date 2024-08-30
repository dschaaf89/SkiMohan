"use client";

import { Plus } from "lucide-react";
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

interface ClassClientProps {
  data: ClassColumn[];
}

interface ProgCodeTimeSlots {
  [progCode: string]: "Morning" | "Afternoon";
}

type ColorOrder = {
  [key: string]: number;
};

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

export const ClassClient: React.FC<ClassClientProps> = ({ data }) => {
  const params = useParams();
  const router = useRouter();
  const seasonId = params.seasonId;
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<ClassColumn[]>(data);

  const handleDayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    setSelectedDay(selected);

    let filtered: ClassColumn[] = [];

    if (selected.includes("Saturday") || selected.includes("Sunday")) {
      const timeSlot = selected.includes("Morning") ? "Morning" : "Afternoon";
      filtered = data.filter(
        (item) =>
          progCodeTimeSlots[item.progCode] === timeSlot &&
          item.DAY === selected.split(" ")[0]
      );
    } else {
      filtered = data.filter((item) => item.DAY === selected);
    }

    setFilteredData(filtered);
  };

  const handleExportToPDF = async () => {
    const exportData = [...filteredData];

    exportData.sort((a, b) => {
      const colorOrder: ColorOrder = { MK: 1, Red: 2, Yellow: 2, Blue: 3 };
      const defaultColorOrderValue = 999;

      const colorRankA = colorOrder[a.meetColor] || defaultColorOrderValue;
      const colorRankB = colorOrder[b.meetColor] || defaultColorOrderValue;

      if (colorRankA !== colorRankB) {
        return colorRankA - colorRankB;
      }

      return a.meetingPoint - b.meetingPoint;
    });

    const doc = new jsPDF({
      orientation: "landscape",
    });
    const title = selectedDay
      ? `List of Classes for ${selectedDay}`
      : "List of All Classes";
    doc.setFontSize(18);
    doc.text(title, 15, 10);

    const columns = [
      { title: "Sign#", dataKey: "meetingPoint" },
      { title: "meetColor", dataKey: "meetColor" },
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
      discipline: classes.discipline,
      Level: classes.Level,
      Age: classes.Age,
      classId: classes.classId,
      meetColor: classes.meetColor,
      instructorName: classes.instructorName,
      instructorPhone: classes.instructorPhone,
    }));

    doc.autoTable({ columns: columns, body: rows });

    const fileName = selectedDay
      ? `${selectedDay.replace(" ", "_")}_classes.pdf`
      : "All_Classes.pdf";
    doc.save(fileName);
  };

  async function generatePayCardPDFs(classes: ClassColumn[]): Promise<void> {
    try {
      const response = await fetch(
        `/api/${params.seasonId}/classes/classCard`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(classes),
        }
      );

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

  return (
    <>
      <div className=" flex items-center justify-between">
        <Heading
          title={`Classes (${filteredData.length})`}
          description="Manage Classes for the season website"
        />
      </div>
      <div className="flex items-center">
        <Button
          className="mr-4"
          onClick={() => generatePayCardPDFs(filteredData)}
        >
          Export Pay Slips
        </Button>
        <Button
          className="mr-4"
          onClick={() => router.push(`/${params.seasonId}/classes/new`)}
        >
          <Plus className=" m-2 b-4 w-4" />
          Add New
        </Button>
        <Button className="mr-4" onClick={handleExportToPDF}>
          <Plus className="mr-4 b-4 w-4" />
          Export Classes
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
      <DataTable searchKey="classId" columns={columns} data={filteredData} />
    </>
  );
};
