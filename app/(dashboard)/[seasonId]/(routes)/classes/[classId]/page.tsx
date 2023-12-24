import prismadb from "@/lib/prismadb";
import {ClassForm} from "./components/class-form";

const ClassPage = async ({ params }: { params: { classId: string } }) => {
  let classes = null;

  // Check if the classId is for creating a new class
  if (params.classId !== "new") {
    // Convert classId to an integer
    const classIdInt = parseInt(params.classId, 10);

    // Validate the integer conversion
    if (!isNaN(classIdInt)) {
      classes = await prismadb.classes.findUnique({
        where: {
          classId: classIdInt
        }
      });
    }
  }

  // If params.classId is "new" or conversion fails, 'classes' remains null
  // which signifies a new class creation scenario

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ClassForm initialData={classes} />
      </div>
    </div>
  )
}

export default ClassPage;
