"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export type InstructorColumn = {
  id:string;
  UniqueID: string;
  NAME_FIRST: string;
  NAME_LAST: string;
  HOME_TEL: string;
  BRTHD: string | Date;
  E_mail_main: string;
  ADDRESS: string;
  CITY: string;
  STATE: string;
  ZIP: string;
  STATUS:string;
  COMMENTS:string;
  prevYear:string;
  dateReg:string;
  emailCommunication:boolean;
  InstructorType:string;
  PSIA:string;
  createAt: Date;
  updateAt: Date;
  AASI:string;
  testScore:string;
  ParentAuth:boolean;
  OverNightLodge:boolean;
  ageRequestByStaff:string[] | null;
  clinics:string[] | null;
  clinicInstructor:boolean;
  Supervisor:boolean;
  classTimeIds:number[] | null;
}



export const columns: ColumnDef<InstructorColumn>[] = [
  {
    id:"actions",
    cell: ({row}) => <CellAction data={row.original}/>
  },
  {
    accessorKey: "UniqueID",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          UniqueID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "NAME_FIRST",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          First Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "NAME_LAST",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "HOME_TEL",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Phone
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "BRTHD",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Birthday
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "E_mail_main",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Main Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "ADDRESS",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Address
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "CITY",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          City
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "STATE",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          State
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  
  {
    accessorKey: "ZIP",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Zip
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "AGE",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          AGE
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  // {
  //   accessorKey: "Employer",
  //   header: "Employer",
  // },
  // {
  //   accessorKey: "Occupation",
  //   header: "Occupation",
  // },
  // {
  //   accessorKey: "W_Tel",
  //   header: "Work Telephone",
  // },
  // {
  //   accessorKey: "CCPayment",
  //   header: "Credit Card Payment",
  // },
  // {
  //   accessorKey: "DateFeePaid",
  //   header: "Date Fee Paid",
  // },
  {
    accessorKey: "PSIA",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          PSIA
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "AASI",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          AASI
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "InstructorType",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Instructor Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "COMMENTS",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Comments
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  // {
  //   accessorKey: "NumDays",
  //   header: "Number of Days",
  // },
  // {
  //   accessorKey: "ApplyingFor",
  //   header: "Applying For",
  // },
  // {
  //   accessorKey: "PaymentStatus",
  //   header: "Payment Status",
  // },
  // {
  //   accessorKey: "PROG_CODE",
  //   header: "Program Code",
  // },
  // {
  //   accessorKey: "Clinic1",
  //   header: "Clinic 1",
  // },
  // {
  //   accessorKey: "Clinic2",
  //   header: "Clinic 2",
  // },
  // {
  //   accessorKey: "Clinic3",
  //   header: "Clinic 3",
  // },
  // {
  //   accessorKey: "Clinic4",
  //   header: "Clinic 4",
  // },
  // {
  //   accessorKey: "Clinic5",
  //   header: "Clinic 5",
  // },
  // {
  //   accessorKey: "Clinic6",
  //   header: "Clinic 6",
  // },
  // {
  //   accessorKey: "AcceptedTerms",
  //   header: "Accepted Terms",
  //   cell: info => info.getValue() ? "Yes" : "No",
  // },
  // {
  //   accessorKey: "Schedule1",
  //   header: "Schedule 1",
  //   cell: info => info.getValue() ? "Yes" : "No",
  // },
  // {
  //   accessorKey: "Schedule2",
  //   header: "Schedule 2",
  //   cell: info => info.getValue() ? "Yes" : "No",
  // },
  // {
  //   accessorKey: "Schedule3",
  //   header: "Schedule 3",
  //   cell: info => info.getValue() ? "Yes" : "No",
  // },
  // {
  //   accessorKey: "Schedule4",
  //   header: "Schedule 4",
  //   cell: info => info.getValue() ? "Yes" : "No",
  // },
  // {
  //   accessorKey: "Schedule5",
  //   header: "Schedule 5",
  //   cell: info => info.getValue() ? "Yes" : "No",
  // },
  // {
  //   accessorKey: "Schedule6",
  //   header: "Schedule 6",
  //   cell: info => info.getValue() ? "Yes" : "No",
  // },
  // {
  //   accessorKey: "Schedule7",
  //   header: "Schedule 7",
  //   cell: info => info.getValue() ? "Yes" : "No",
  // },
  // {
  //   accessorKey: "Schedule8",
  //   header: "Schedule 8",
  //   cell: info => info.getValue() ? "Yes" : "No",
  // },
  // {
  //   accessorKey: "Schedule9",
  //   header: "Schedule 9",
  //   cell: info => info.getValue() ? "Yes" : "No",
  // },
  // {
  //   accessorKey: "WComment",
  //   header: "Comment",
  // },
  // {
  //   accessorKey: "returning",
  //   header: "Returning",
  //   cell: info => info.getValue() ? "Yes" : "No",
  // },
  {
    accessorKey: "createAt",
    header: "Creation Date",
  },
  {
    accessorKey: "updateAt",
    header: "Update Date",
  }
  // ... Continue adding remaining fields following the pattern above ...
];


