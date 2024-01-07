import { format } from "date-fns";

import prismadb from "@/lib/prismadb";
import { Button } from "@/components/ui/button";
import { ClassColumn } from "./components/columns"
import { ClassClient } from "./components/client";

const ClassesPage = async ({ params }: { params: { seasonId: string } }) => {

  const classes = await prismadb.classes.findMany({
    where: {
      seasonId: params.seasonId
    }
  });

  const formattedClasses: ClassColumn[] = classes.map((item) => ({
    DAY:item.day ||"",
    classId:item.classId || 0,
    meetColor:item.meetColor || "",
    meetingPoint:item.meetingPoint || 0,
    discipline: item.discipline || "",
    numberStudents:item.numberStudents || 0,
    Level: item.Level || "",
    Age: item.Age || 0,
    instructorID: Number(item.instructorId),
    progCode:item.progCode || "",
    assistantId:Number(item.assistantId),

    }
  ));

  
  return (
    <div className="flex-col">
      <div className=" flex-1 space-y-4 p-8 pt-6">
        <h1 className="text-center">Classes</h1>
        <ClassClient data={formattedClasses}/>
      </div>
    </div>
  );
};

export default ClassesPage
