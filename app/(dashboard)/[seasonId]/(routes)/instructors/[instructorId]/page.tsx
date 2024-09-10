import prismadb from "@/lib/prismadb";
import { InstructorForm } from "./components/instructor-form";
import { notFound } from "next/navigation";

const InstructorPage = async ({
  params
}: {
  params: { instructorId?: string, seasonId: string }
}) => {
  let instructor = null;

  // Check if instructorId is provided and not "new"
  if (params.instructorId && params.instructorId !== "new") {
    const instructorId = parseInt(params.instructorId, 10);

    if (!isNaN(instructorId)) {
      // Fetch the instructor record
      instructor = await prismadb.instructor.findUnique({
        where: { UniqueID: instructorId },
        include: {
          classTimes: true, // Include any relations if needed
          clinics: true, // Include clinics or other relations
        },
      });

      // If the instructor is not found, return a notFound response
      if (!instructor) {
        return notFound();
      }
    } else {
      return notFound(); // If instructorId is not a valid number, return a notFound response
    }
  }

  // Render the form with either the found instructor or empty data for a new instructor
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <InstructorForm 
          initialData={instructor} 
        />
      </div>
    </div>
  );
};

export default InstructorPage;
