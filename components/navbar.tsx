import { UserButton, auth } from "@clerk/nextjs";

import { MainNav } from "@/components/main-nav";
import SeasonSwitcher from "@/components/season-switcher";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";

const Navbar = async () => {
  const {userId} = auth();
  if(!userId){
    redirect("/sign-in");
  }

  const seasons = await prismadb.season.findMany(
    );

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <SeasonSwitcher items={ seasons }/>
        <MainNav className="mx-6"/>
        <div className="ml-auto flex items-center space-x-4">
          <UserButton afterSignOutUrl="/"/>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
