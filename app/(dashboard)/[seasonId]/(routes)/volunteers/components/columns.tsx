"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"
export type VolunteerColumn = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  homePhone?: string | null;
  mobilePhone: string;
  workPhone?: string | null;
  Address: string;
  city: string;
  state: string;
  zipCode: string;
  email: string;
  employerSchool?: string | null;
  occupationGrade?: string | null;
  isGreeter: boolean;
  isProgramCoordinator: boolean;
  isBusChaperone: boolean;
  busChaperoneSchool?: string | null;
  isEmergencyDriver: boolean;
  emergencyDriverDay?: string | null;
  agreeToTerms: boolean;
  busChaperoneWk1: boolean,
  busChaperoneWk2: boolean,
  busChaperoneWk3: boolean,
  busChaperoneWk4: boolean,
  busChaperoneWk5: boolean,
  busChaperoneWk6: boolean,
  emergencyDriverWk1: boolean,
  emergencyDriverWk2: boolean,
  emergencyDriverWk3: boolean,
  emergencyDriverWk4: boolean,
  emergencyDriverWk5: boolean,
  emergencyDriverWk6:boolean,
  GreetTimeSlot:String
};

const getVolunteerRoles = (volunteer: VolunteerColumn): string => {
  const roles: string[] = [];
  if (volunteer.isGreeter) roles.push("Greeter");
  if (volunteer.isProgramCoordinator) roles.push("Program Coordinator");
  if (volunteer.isBusChaperone) roles.push("Bus Chaperone");
  if (volunteer.isEmergencyDriver) roles.push("Emergency Driver");

  return roles.length > 0 ? roles.join(", ") : "No role assigned"; // Default message if no roles are checked
};

export const columns: ColumnDef<VolunteerColumn>[] = [
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
  {
    accessorKey: "actions",
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

// Define the columns for displaying VolunteerColumn data
// export const columns: ColumnDef<VolunteerColumn>[] = [
//   {
//     accessorKey: "firstName",
//     header: "First Name",
//   },
//   {
//     accessorKey: "lastName",
//     header: "Last Name",
//   },
//   {
//     accessorKey: "employerSchool",
//     header: "Program",
//   },
//   {
//     accessorKey: "mobilePhone",
//     header: "Mobile Phone",
//   },
//   {
//     accessorKey: "email",
//     header: "Email",
//   },
//   {
//     accessorKey: "isGreeter",
//     header: "Greeter",
//   },
//   {
//     accessorKey: "isProgramCoordinator",
//     header: "Program Coordinator",
//   },
//   {
//     accessorKey: "isBusChaperone",
//     header: "Bus Chaperone",
//   },
//   {
//     accessorKey: "isEmergencyDriver",
//     header: "Emergency Driver",
//   },
//   {
//     accessorKey: "agreeToTerms",
//     header: "Agreed to Terms",
//   },
//   {
//     accessorKey: "actions",
//     id: "actions",
//     header: "Actions",
//     cell: ({ row }) => <CellAction data={row.original} />,
//   },
// ];