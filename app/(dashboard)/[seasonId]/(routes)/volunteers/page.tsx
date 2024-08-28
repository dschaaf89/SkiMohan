import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { VolunteerColumn } from "./components/columns"
import { VolunteerClient } from "./components/client";
import { ApiList } from "@/components/ui/api-list";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading"
const VolunteerPage = async ({
  params
}: {
  params: { seasonId: string }
}) => {
  const volunteers = await prismadb.volunteer.findMany({
    where: {
      seasonId: params.seasonId
    },
  });

  const formattedVolunteers: VolunteerColumn[] = volunteers.map((item): VolunteerColumn => ({
    id: item.id,
    firstName: item.firstName,
    lastName: item.lastName,
    birthDate: item.birthDate,
    homePhone: item.homePhone,
    mobilePhone: item.mobilePhone,
    workPhone: item.workPhone,
    Address: item.Address,
    city: item.city,
    state: item.state,
    zipCode: item.zipCode,
    email: item.email,
    employerSchool: item.employerSchool,
    occupationGrade: item.occupationGrade,
    isGreeter: item.isGreeter,
    isProgramCoordinator: item.isProgramCoordinator,
    isBusChaperone: item.isBusChaperone,
    busChaperoneSchool: item.busChaperoneSchool,
    isEmergencyDriver: item.isEmergencyDriver,
    emergencyDriverDay: item.emergencyDriverDay,
    agreeToTerms: item.agreeToTerms,
    busChaperoneWk1: item.busChaperoneWk1 ?? false,
    busChaperoneWk2: item.busChaperoneWk2 ?? false,
    busChaperoneWk3: item.busChaperoneWk3 ?? false,
    busChaperoneWk4: item.busChaperoneWk4 ?? false,
    busChaperoneWk5: item.busChaperoneWk5 ?? false,
    busChaperoneWk6: item.busChaperoneWk6 ?? false,
    emergencyDriverWk1: item.emergencyDriverWk1 ?? false,
    emergencyDriverWk2: item.emergencyDriverWk2 ?? false,
    emergencyDriverWk3: item.emergencyDriverWk3 ?? false,
    emergencyDriverWk4: item.emergencyDriverWk4 ?? false,
    emergencyDriverWk5: item.emergencyDriverWk5 ?? false,
    emergencyDriverWk6: item.emergencyDriverWk6 ?? false,
    GreetTimeSlot: item.GreetTimeSlot,
  }));
  

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <VolunteerClient data={formattedVolunteers} />
        <Heading title="API" description="API Calls for volunteers" />
      <Separator />
        <ApiList entityName="volunteers" entityIdName="volunteerId" />
      </div>
    </div>
  );
};

export default VolunteerPage;