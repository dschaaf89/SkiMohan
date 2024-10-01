/* eslint-disable react/no-unescaped-entities */
"use client";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { StudentColumn } from "../../students/components/columns";
import { VolunteerColumn } from "../../volunteers/components/columns";
import { WaitlistColumn } from "../../waitlist/components/columns";
import { BarChartComponent } from "@/components/BarChartComponent"; // Ensure to import the BarChartComponent
import { UpdateStudentModal } from "@/components/modals/update-student-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CellAction } from "./cell-action";
import { CellAction as CellAction2 } from "./cell-action2";
import { CellAction as CellAction3 } from "./cell-action3";
interface CoordinatorClientProps {
  data: {
    students: StudentColumn[];
    volunteers: VolunteerColumn[];
    waitlistStudents: WaitlistColumn[];
  };
}

// Define a union type for valid program keys
type ProgramKey =
  | "EastsideCatholic"
  | "Interlake"
  | "Meadowbrook"
  | "Ballard"
  | "NorthEastSeattle"
  | "Roosevelt"
  | "Soundview"
  | "ThortonCreek"
  | "SalmonBay"
  | "SouthJackson"
  | "Wallingford";

// Define the dictionary with explicit typing
const programToPrefix: Record<ProgramKey, string> = {
  EastsideCatholic: "EAST-",
  Interlake: "LINC-",
  Meadowbrook: "NATH-",
  Ballard: "BALL-",
  NorthEastSeattle: "ECKS-",
  Roosevelt: "ROOS-",
  Soundview: "WHIT-",
  ThortonCreek: "JANE-",
  Wallingford: "HAML-",
  SouthJackson:"SJAC-",
  SalmonBay:"SALB-",
};

interface BusLocation {
  busCompany: string;
  busDriver: string;
  busDriverPhone: string;
  pickUpLocation: string;
  pickUpTime: string;
  dropOffTime: string;
}

const busLocations: Record<ProgramKey, BusLocation> = {
  SouthJackson: {
    busCompany: "", // Placeholder
    busDriver: "", // Placeholder
    busDriverPhone: "", // Placeholder
    pickUpLocation:
      "",
    pickUpTime: "3:15 PM",
    dropOffTime: "Approximately 10:00 PM",
  },
  SalmonBay: {
    busCompany: "", // Placeholder
    busDriver: "", // Placeholder
    busDriverPhone: "", // Placeholder
    pickUpLocation:"",
    pickUpTime: "3:15 PM",
    dropOffTime: "Approximately 10:00 PM",
  },
  EastsideCatholic: {
    busCompany: "", // Placeholder
    busDriver: "", // Placeholder
    busDriverPhone: "", // Placeholder
    pickUpLocation:
      "Eastside Catholic High School parking lot (232 228th Ave SE, Sammamish, WA 98074)",
    pickUpTime: "3:15 PM",
    dropOffTime: "Approximately 10:00 PM",
  },
  Interlake: {
    busCompany: "", // Placeholder
    busDriver: "", // Placeholder
    busDriverPhone: "", // Placeholder
    pickUpLocation:
      "Interlake High School parking lot (16245 NE 24th St, Bellevue, WA 98008)",
    pickUpTime: "3:50 PM",
    dropOffTime: "Approximately 10:30 PM",
  },
  Meadowbrook: {
    busCompany: "", // Placeholder
    busDriver: "", // Placeholder
    busDriverPhone: "", // Placeholder
    pickUpLocation:
      "Meadowbrook Playfield parking lot (10750 30th Ave NE, Seattle, WA 98125)",
    pickUpTime: "3:45 PM",
    dropOffTime: "Approximately 10:30 PM",
  },
  Ballard: {
    busCompany: "", // Placeholder
    busDriver: "", // Placeholder
    busDriverPhone: "", // Placeholder
    pickUpLocation:
      "Ballard Pool Parking Lot (1471 NW 67th St, Seattle, WA 98117)",
    pickUpTime: "4:00 PM",
    dropOffTime: "Approximately 10:30 PM",
  },
  NorthEastSeattle: {
    busCompany: "", // Placeholder
    busDriver: "", // Placeholder
    busDriverPhone: "", // Placeholder
    pickUpLocation:
      "South lot along 30th, furthest from the flag pole (30th Ave NE south of 75th)",
    pickUpTime: "3:50 PM",
    dropOffTime: "Approximately 10:30 PM",
  },
  Roosevelt: {
    busCompany: "", // Placeholder
    busDriver: "", // Placeholder
    busDriverPhone: "", // Placeholder
    pickUpLocation: "Southbound on 15th Ave. NE between NE 65th and NE 68th",
    pickUpTime: "3:45 PM",
    dropOffTime: "Approximately 10:30 PM",
  },
  Soundview: {
    busCompany: "", // Placeholder
    busDriver: "", // Placeholder
    busDriverPhone: "", // Placeholder
    pickUpLocation: "Parking lot on 15th Ave. NW between 92nd & 95th",
    pickUpTime: "4:00 PM",
    dropOffTime: "Approximately 10:30 PM",
  },
  ThortonCreek: {
    busCompany: "", // Placeholder
    busDriver: "", // Placeholder
    busDriverPhone: "", // Placeholder
    pickUpLocation:
      "NE side of school bus zone (11051 34th Ave NE, Seattle, WA 98125)",
    pickUpTime: "4:00 PM",
    dropOffTime: "Approximately 10:30 PM",
  },
  Wallingford: {
    busCompany: "", // Placeholder
    busDriver: "", // Placeholder
    busDriverPhone: "", // Placeholder
    pickUpLocation: "NE side of school",
    pickUpTime: "4:00 PM",
    dropOffTime: "Approximately 10:30 PM",
  },
};

export const CoordinatorClient: React.FC<CoordinatorClientProps> = ({
  data,
}) => {
  const { user } = useUser(); // Fetch user information from Clerk
  const isCoordinator = user?.publicMetadata?.role === "coordinator"; // Check if user is Coordinator
  const isAdmin = user?.publicMetadata?.role === "administrator"; // Check if user is Administrator
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const seasonId = params.seasonId;
  const programIdFromUrl = searchParams.get("programId");
  
  const [selectedProgram, setSelectedProgram] = useState<ProgramKey | undefined>(
    programIdFromUrl as ProgramKey || undefined
  );
  const isProgramLocked = isCoordinator && !isAdmin;

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState<StudentColumn[]>([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState<VolunteerColumn[]>(
    []
  );
  const [filteredWaitlistStudents, setFilteredWaitlistStudents] = useState<
    WaitlistColumn[]
  >([]);

  const toggleUpdateModal = () => {
    setIsUpdateModalOpen(!isUpdateModalOpen);
  };

  const programs = [
    { value: "EastsideCatholic", label: "Eastside Catholic" },
    { value: "Interlake", label: "Interlake" },
    { value: "Meadowbrook", label: "Meadowbrook" },
    { value: "Ballard", label: "Ballard" },
    { value: "NorthEastSeattle", label: "NorthEast Seattle" },
    { value: "Roosevelt", label: "Roosevelt" },
    { value: "Soundview", label: "Soundview" },
    { value: "ThortonCreek", label: "Thorton-Creek" },
    { value: "Wallingford", label: "Wallingford" },
    { value: "SouthJackson", label: "South Jackson" },
    { value: "SalmonBay ", label: "Salmon Bay" },
  ];

  const filterDataByProgram = (selectedProgram: ProgramKey | undefined) => {
    if (!selectedProgram) {
      setFilteredStudents(data.students);
      setFilteredVolunteers(data.volunteers);
      setFilteredWaitlistStudents(data.waitlistStudents);
    } else {
      const selectedPrefix = programToPrefix[selectedProgram];
      const filteredStudents = data.students.filter((student) =>
        student.ProgCode.startsWith(selectedPrefix)
      );
      const filteredVolunteers = data.volunteers.filter(
        (volunteer) => volunteer.employerSchool === selectedProgram
      );
      const filteredWaitlistStudents = data.waitlistStudents.filter((student) =>
        student.ProgCode.startsWith(selectedPrefix)
      );
      setFilteredStudents(filteredStudents);
      setFilteredVolunteers(filteredVolunteers);
      setFilteredWaitlistStudents(filteredWaitlistStudents);
    }
  };

  useEffect(() => {
    filterDataByProgram(selectedProgram);
  }, [selectedProgram, data]);

  useEffect(() => {
    // If there's a programId in the URL and the user is a coordinator, lock the selection.
    if (programIdFromUrl && isCoordinator) {
      setSelectedProgram(programIdFromUrl as ProgramKey);
    }
  }, [programIdFromUrl, isCoordinator]);

  const handleProgramChange = (value: string) => {
    if (!isProgramLocked) {
      setSelectedProgram(value as ProgramKey);
    }
  };

  const transportationOnlyCount = filteredStudents.filter((student) =>
    student.ProgCode?.endsWith("-TR")
  ).length;

  const lessonsAndTransportationCount = filteredStudents.filter((student) =>
    student.ProgCode?.endsWith("-LT")
  ).length;

  const chartData = {
    labels: ["Transportation Only", "Lessons and Transportation"],
    datasets: [
      {
        label: "Number of Students",
        data: [transportationOnlyCount, lessonsAndTransportationCount],
        backgroundColor: ["rgba(255, 99, 132, 0.5)", "rgba(54, 162, 235, 0.5)"],
      },
    ],
  };
  const formattedVolunteersWk1 = filteredVolunteers.filter(
    (volunteer) => volunteer.busChaperoneWk1 || volunteer.emergencyDriverWk1
  );

  const formattedVolunteersWk2 = filteredVolunteers.filter(
    (volunteer) => volunteer.busChaperoneWk2 || volunteer.emergencyDriverWk2
  );

  const formattedVolunteersWk3 = filteredVolunteers.filter(
    (volunteer) => volunteer.busChaperoneWk3 || volunteer.emergencyDriverWk3
  );

  const formattedVolunteersWk4 = filteredVolunteers.filter(
    (volunteer) => volunteer.busChaperoneWk4 || volunteer.emergencyDriverWk4
  );

  const formattedVolunteersWk5 = filteredVolunteers.filter(
    (volunteer) => volunteer.busChaperoneWk5 || volunteer.emergencyDriverWk5
  );

  const formattedVolunteersWk6 = filteredVolunteers.filter(
    (volunteer) => volunteer.busChaperoneWk6 || volunteer.emergencyDriverWk6
  );

  return (
    <>
       <Select
  value={selectedProgram}  // Use 'selectedProgram' here
  onValueChange={handleProgramChange}
  disabled={isProgramLocked && !isAdmin} // Lock dropdown for Coordinators
>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Program" />
        </SelectTrigger>
        <SelectContent>
          {programs.map((program) => (
            <SelectItem key={program.value} value={program.value}>
              {program.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="grid grid-cols-2 gap-4 p-8 pt-6">
        {/* Student Roster */}
        <div className="bg-gray-100 p-4 rounded-lg shadow">
          <h2 className="font-bold text-center">
            Students ({filteredStudents.length})
          </h2>
          <Card>
            <CardHeader>
              <h1 className="font-bold text-center">
                Student Roster <br />
              </h1>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chart" className="">
                <TabsList>
                  <TabsTrigger value="chart">Chart</TabsTrigger>
                  <TabsTrigger value="roster">Roster</TabsTrigger>
                </TabsList>
                <TabsContent value="chart">
                  <BarChartComponent data={chartData} />
                </TabsContent>
                <TabsContent value="roster">
                  <DataTable
                    searchKeys={["NAME_LAST"]}
                    columns={studentColumns}
                    data={filteredStudents}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

       {/* Bus Information */}
<div className="bg-gray-100 p-4 rounded-lg shadow">
  <Card>
    <CardHeader>
      <CardTitle className="text-center">Bus Information</CardTitle>
    </CardHeader>
    <CardContent>
      {selectedProgram && busLocations[selectedProgram] ? (
        <>
          <p className="leading-loose">
            <strong>Bus Company:</strong> {busLocations[selectedProgram].busCompany || "Not available"}
          </p>
          <p className="leading-loose">
            <strong>Bus Driver:</strong> {busLocations[selectedProgram].busDriver || "Not available"}
          </p>
          <p className="leading-loose">
            <strong>Bus Driver Phone Number:</strong> {busLocations[selectedProgram].busDriverPhone || "Not available"}
          </p>
          <p className="leading-loose">
            <strong>Pick Up Location:</strong> {busLocations[selectedProgram].pickUpLocation || "Not available"}
          </p>
          <p className="leading-loose">
            <strong>Pick Up Time:</strong> {busLocations[selectedProgram].pickUpTime || "Not available"}
          </p>
          <p className="leading-loose">
            <strong>Drop Off Time:</strong> {busLocations[selectedProgram].dropOffTime || "Not available"}
          </p>
        </>
      ) : (
        <p>No bus information available for the selected program.</p>
      )}

      {/* Seating Charts Section */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold">Seating Charts</h3>
        <p>52-passenger bus seating chart:</p>
        <a
          href="https://drive.google.com/file/d/1QTtPOhXvkTLRR2T83hplgP02AM3QcxRG/view?usp=drive_link"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600"
        >
          View Seating Chart
        </a>
      </div>

      <div className="mt-10">
        <p>Any other bus related information</p>
      </div>
    </CardContent>
  </Card>
</div>


        {/* Waitlist Roster */}
        <div className="bg-gray-100 p-4 rounded-lg shadow">
          <h2 className="font-bold text-center">Waitlist</h2>
          <DataTable
            searchKeys={["NAME_LAST"]}
            columns={WaitlistColumns}
            data={filteredWaitlistStudents}
          />
        </div>
        {/* Volunteer Roster */}
        <div className="bg-gray-100 p-4 rounded-lg shadow">
          <h2 className="font-bold text-center">Volunteers</h2>
          <Card>
            <CardHeader></CardHeader>
            <CardContent>
              <Tabs defaultValue="Week1" className="">
                <TabsList>
                  <TabsTrigger value="Week1">Week 1</TabsTrigger>
                  <TabsTrigger value="Week2">Week 2</TabsTrigger>
                  <TabsTrigger value="Week3">Week 3</TabsTrigger>
                  <TabsTrigger value="Week4">Week 4</TabsTrigger>
                  <TabsTrigger value="Week5">Week 5</TabsTrigger>
                  <TabsTrigger value="Week6">Week 6</TabsTrigger>
                </TabsList>
                <TabsContent value="Week1">
                  <DataTable
                    searchKeys={["NAME_LAST"]}
                    columns={Volunteercolumns}
                    data={formattedVolunteersWk1}
                  />
                </TabsContent>
                <TabsContent value="Week2">
                  <DataTable
                    searchKeys={["NAME_LAST"]}
                    columns={Volunteercolumns}
                    data={formattedVolunteersWk2}
                  />
                </TabsContent>
                <TabsContent value="Week3">
                  <DataTable
                    searchKeys={["NAME_LAST"]}
                    columns={Volunteercolumns}
                    data={formattedVolunteersWk3}
                  />
                </TabsContent>
                <TabsContent value="Week4">
                  <DataTable
                    searchKeys={["NAME_LAST"]}
                    columns={Volunteercolumns}
                    data={formattedVolunteersWk4}
                  />
                </TabsContent>
                <TabsContent value="Week5">
                  <DataTable
                    searchKeys={["NAME_LAST"]}
                    columns={Volunteercolumns}
                    data={formattedVolunteersWk5}
                  />
                </TabsContent>
                <TabsContent value="Week6">
                  <DataTable
                    searchKeys={["NAME_LAST"]}
                    columns={Volunteercolumns}
                    data={formattedVolunteersWk6}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-2 bg-gray-100 p-4 rounded-lg shadow text-center flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Center</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Documents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-lg font-semibold">
                Questions? Please Contact your Program's Coordinator
                Coordinator:
              </p>
              <p>Emily Sheehan</p>
              <p>Phone:425-868-3820 ex 105</p>
              <p>Email: programmanagement@skimohan.com</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

const studentColumns: ColumnDef<StudentColumn>[] = [
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
  {
    accessorKey: "NAME_FIRST",
    header: "First Name",
  },
  {
    accessorKey: "NAME_LAST",
    header: "Last Name",
  },
  {
    accessorKey: "HOME_TEL",
    header: "Phone",
  },
  {
    accessorKey: "E_mail_main",
    header: "Email",
  },
];

const WaitlistColumns: ColumnDef<WaitlistColumn>[] = [
  {
    id: "actions",
    cell: ({ row }) => <CellAction2 data={row.original} />,
  },
  {
    accessorKey: "NAME_FIRST",
    header: "First Name",
  },
  {
    accessorKey: "NAME_LAST",
    header: "Last Name",
  },
  {
    accessorKey: "Program",
    header: "Program",
  },
  {
    accessorKey: "HOME_TEL",
    header: "Phone",
  },
  {
    accessorKey: "E_mail_main",
    header: "Email",
  },
];

const getVolunteerRoles = (volunteer: VolunteerColumn): string => {
  const roles: string[] = [];
  if (volunteer.isGreeter) roles.push("Greeter");
  if (volunteer.isProgramCoordinator) roles.push("Program Coordinator");
  if (volunteer.isBusChaperone) roles.push("Bus Chaperone");
  if (volunteer.isEmergencyDriver) roles.push("Emergency Driver");

  return roles.length > 0 ? roles.join(", ") : "No role assigned"; // Default message if no roles are checked
};

export const Volunteercolumns: ColumnDef<VolunteerColumn>[] = [
  {
    id: "actions",
    cell: ({ row }) => <CellAction3 data={row.original} />,
  },
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "employerSchool",
    header: "Program",
  },
  {
    accessorKey: "mobilePhone",
    header: "Mobile Phone",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "roles",
    header: "Roles", // New column to display roles
    cell: ({ row }) => <span>{getVolunteerRoles(row.original)}</span>, // Use custom function to get roles
  },
];
