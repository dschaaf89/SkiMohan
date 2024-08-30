import prismadb from "@/lib/prismadb";
import { StudentForm } from "../../students/[studentId]/components/student-form";


const StudentPage = async ({
  params
}:{
  params: { studentId : number }
}) => {

const student = await prismadb.student.findUnique({
  where:{
    UniqueID: params.studentId
  }
});


  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <StudentForm 
        initialData={student}
        />
      </div>
    </div>
  )
}

export default StudentPage;