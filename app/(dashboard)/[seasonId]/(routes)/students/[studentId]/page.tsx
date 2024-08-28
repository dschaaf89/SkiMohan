import prismadb from "@/lib/prismadb";
import { StudentForm } from "./components/student-form";


const StudentPage = async ({
  params
}: {
  params: { studentId: string }
}) => {

  // Ensure studentId is an integer
  const studentId = parseInt(params.studentId, 10);

  // Fetch the student record
  const student = await prismadb.student.findUnique({
    where: {
      UniqueID: studentId
    }
  });

  if (!student) {
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <p>Student not found.</p>
        </div>
      </div>
    );
  }


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