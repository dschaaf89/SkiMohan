import prismadb from "@/lib/prismadb";
import { ClassForm } from "./components/class-form";

const ClassPage = async ({ params }: { params: { classId: string; seasonId: string } }) => {
  let classes = null;

  // Check if the classId is for creating a new class
  if (params.classId !== "new") {
    const classIdInt = parseInt(params.classId, 10);

    if (!isNaN(classIdInt)) {
      classes = await prismadb.classes.findUnique({
        where: {
          classId: classIdInt,
        },
        include: {
          students: true, // Include related students
        },
      });
    }
  }

  const allStaff = await prismadb.instructor.findMany({
    where: {
      seasonId: params.seasonId,
    },
    include: {
      classTimes: {
        include: {
          classTime: true, // Include the related `ClassTime` data
        },
      },
    },
  });
  
  const dayOfClass = classes?.day || null;
  
  // Map instructors and filter by the day of the class
  const instructors = allStaff
    .filter((staff) =>
      staff.classTimes.some(
        (ct) => ct.classTime.day === dayOfClass // Filter instructors by the class day
      )
    )
    .map((staff) => ({
      ...staff,
      classTimes: staff.classTimes.map((ct) => ({
        day: ct.classTime.day,
      })),
    }))
    .sort((a, b) => a.NAME_LAST.localeCompare(b.NAME_LAST));
  
  // Map assistants similarly
  const assistants = allStaff
  .filter(
    (staff) =>
      staff.InstructorType && // Ensure InstructorType exists
      staff.InstructorType.toLowerCase().includes("assistant") && // Check if it's an assistant
      staff.classTimes.some(
        (ct) => ct.classTime.day === dayOfClass // Filter by class day
      )
  )
  .map((staff) => ({
    ...staff,
    classTimes: staff.classTimes.map((ct) => ({
      day: ct.classTime.day,
    })),
  }))
  .sort((a, b) => a.NAME_LAST.localeCompare(b.NAME_LAST));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ClassForm
          initialData={classes}
          instructors={instructors}
          assistants={assistants}
        />
      </div>
    </div>
  );
};

export default ClassPage;
