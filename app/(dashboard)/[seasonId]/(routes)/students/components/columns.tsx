"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import {Button} from "@/components/ui/button"
import { CellAction } from "./cell-action"

export type StudentColumn = {
  id:string;
  UniqueID: string;
  NAME_FIRST: string;
  NAME_LAST: string;
  HOME_TEL: string;
  ADDRESS: string;
  CITY: string;
  STATE: string;
  ZIP: string;
  student_tel: string;
  Email_student: string; // Adjust nullability if needed
  BRTHD: string | Date; // Adjust based on the actual type
  AGE: number; // Adjust nullability if needed
  GradeLevel: string;
  APPLYING_FOR: string;
  LEVEL: string;
  Approach: string;
  E_mail_main: string;
  E_NAME: string;
  E_TEL: string;
  CCPayment: string;
  ProgCode: string;
  BUDDY: string;
  WComment: string;
  DateFeePaid: string;
  PaymentStatus: string;
  AcceptedTerms: string;
  AppType: number; // Adjust nullability if needed
  Employer: string;
  C_TEL: string;
  Occupation: string;
  W_TEL: string;
  AGE_GROUP: number; // Optional field
  AGRESSIVENESS: string;
  GENDER: string;
  FeeComment:string;
  DAY:string;
  StartTime: string;
  EndTime: string;
  //updateAt:string | Date;
}




export const columns: ColumnDef<StudentColumn>[] = [
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
    accessorKey: "ProgCode",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ProgCode
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
          First
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
          Last
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
    accessorKey: "HOME_TEL",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          H_Phone
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
 
  {
    accessorKey: "Email_student",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Student Email
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
          Birthdate
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
  {
    accessorKey: "GENDER",
    header: "Gender",
  },
  {
    accessorKey: "GradeLevel",
    header: "Grade Level",
  },
  {
    accessorKey: "APPLYING_FOR",
    header: "Applying For",
  },
  
  {
    accessorKey: "LEVEL",
    header: "Level",
  },
  {
    accessorKey: "Approach",
    header: "Approach",
  },
  {
    accessorKey: "AGRESSIVENESS",
    header: "Aggressivness",
  },
  {
    accessorKey: "emailMain",
    header: "Main Email",
  },
  {
    accessorKey: "emergencyName",
    header: "Emergency Contact Name",
  },
  {
    accessorKey: "emergencyTel",
    header: "Emergency Telephone",
  },
  {
    accessorKey: "payment",
    header: "Payment",
  },
 
  {
    accessorKey: "BUDDY",
    header: "Buddy",
  },
  {
    accessorKey: "WComment",
    header: "Comment",
  },
  {
    accessorKey: "DateFeePaid",
    header: "DateFeePaid",
  },
  {
    accessorKey: "createAt",
    header: "Creation Date",
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
  },
  {
    accessorKey: "acceptedTerms",
    header: "Accepted Terms",
  },
  {
    accessorKey: "AppType",
    header: "Application Type",
  },
  {
    accessorKey: "employer",
    header: "Employer",
  },
  {
    accessorKey: "contactTel",
    header: "Contact Telephone",
  },
  {
    accessorKey: "occupation",
    header: "Occupation",
  },
  {
    accessorKey: "workTel",
    header: "Work Telephone",
  },
  {
    accessorKey: "DAY",
    header: "Day",
  },
  {
    accessorKey: "StartTime",
    header: "StartTime",
  },
  {
    accessorKey: "EndTime",
    header: "EndTime",
  },
 
];



