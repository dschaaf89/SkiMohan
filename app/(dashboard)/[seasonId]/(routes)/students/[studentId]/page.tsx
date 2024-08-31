import prismadb from "@/lib/prismadb";
import { StudentForm } from "./components/student-form";
import { notFound } from "next/navigation";

const StudentPage = async ({
  params
}: {
  params: { studentId?: string, seasonId: string }
}) => {
  let student = null;

  // Check if studentId is provided and not "new"
  if (params.studentId && params.studentId !== "new") {
    const studentId = parseInt(params.studentId, 10);

    if (!isNaN(studentId)) {
      // Fetch the student record
      student =  await prismadb.student.findUnique({
        where: { UniqueID: studentId },
        include: {
          class: true, // Include the class relation if you need related data
        },
      });

      // If student is not found, return a notFound response
      if (!student) {
        return notFound();
      }
    } else {
      return notFound(); // If the studentId is not a valid number, return a notFound response
    }
  }
  console.log(student)
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <StudentForm 
          initialData={student} 
          
        />
      </div>
    </div>
  );
};

export default StudentPage;
