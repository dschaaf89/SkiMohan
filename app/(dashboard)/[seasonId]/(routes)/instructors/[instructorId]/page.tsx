import prismadb from "@/lib/prismadb";
import { InstructorForm } from "./components/instructor-form";


const InstructorPage = async ({
  params
}:{
  params: { instructorId : string }
}) => {

const instructor = await prismadb.instructor.findUnique({
  where:{
    id: params.instructorId
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