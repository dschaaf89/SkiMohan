import prismadb from "@/lib/prismadb";
import { InstructorForm } from "./components/instructor-form";

const InstructorPage = async ({
  params
}: {
  params: { instructorId: string } // URL params are always strings
}) => {

  const instructorId = parseInt(params.instructorId); // Convert the string to an integer

  const instructor = await prismadb.instructor.findUnique({
    where: {
      UniqueID: instructorId // Use the converted integer
    }
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <InstructorForm 
          initialData={instructor}
        />
      </div>
    </div>
  )
}

export default InstructorPage;
