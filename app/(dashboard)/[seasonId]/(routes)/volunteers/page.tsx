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
    id:item.id,
    firstName: item.firstName,
    lastName: item.lastName,
    birthDate: item.birthDate,
    homePhone: item.homePhone || null,
    mobilePhone: item.mobilePhone,
    workPhone: item.workPhone || null,
    Address: item.Address,
    city: item.city,
    state: item.state,
    zipCode: item.zipCode,
    email: item.email,
    employerSchool: item.employerSchool || null,
    occupationGrade: item.occupationGrade || null,
    isGreeter: item.isGreeter,
    isProgramCoordinator: item.isProgramCoordinator,
    isBusChaperone: item.isBusChaperone,
    busChaperoneSchool: item.busChaperoneSchool || null,
    isEmergencyDriver: item.isEmergencyDriver,
    emergencyDriverDay: item.emergencyDriverDay || null,
    applicantStatus: item.applicantStatus as "Returning" | "New", // Type assertion
    agreeToTerms: item.agreeToTerms,
  
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