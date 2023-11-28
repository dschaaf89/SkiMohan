import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import { SettingsForm } from "./components/settings-form";
interface SettingsPageProps{
  params: {
    seasonId : string;
  }
};


const SettingsPage: React.FC<SettingsPageProps> = async ({
  params
}) => {
  const {userId} = auth();
  
  if(!userId){
    redirect("/sign-in");
  }

  const season = await prismadb.season.findFirst({
    where: {
      id: params.seasonId
    }
  });
  if(!season){
    redirect("/");
  }
  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
      <SettingsForm initialData={season}/>
      </div>
    </div>

   );
}
 
export default SettingsPage;