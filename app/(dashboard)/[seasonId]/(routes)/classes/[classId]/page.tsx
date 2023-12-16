import prismadb from "@/lib/prismadb";
import {ClassForm} from "./components/class-form";


const ClassPage = async ({
  params
}:{
  params: { classId : number }
}) => {

const classes = await prismadb.classes.findUnique({
  where:{
    classId: params.classId
  }
});


  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ClassForm initialData={classes}/>
      </div>
    </div>
  )
}

export default ClassPage;