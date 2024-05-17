import prismadb from "@/lib/prismadb";
import { VolunteerForm } from "./components/volunteer-form";


const VolunteerPage = async ({
  params
}:{
  params: { volunteerId : string }
}) => {

const volunteer = await prismadb.volunteer.findUnique({
  where:{
    id: params.volunteerId
  }
});


  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <VolunteerForm 
        initialData={volunteer}
        />
      </div>
    </div>
  )
}

export default VolunteerPage;