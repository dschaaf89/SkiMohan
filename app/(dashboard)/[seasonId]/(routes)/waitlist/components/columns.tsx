"use client"

import { ColumnDef } from "@tanstack/react-table"
import { StudentColumn } from "../../students/components/columns"; // Import the StudentColumn type

export type WaitlistColumn = StudentColumn & {
  // You can add additional properties specific to waitlist students here if needed
};

export const columns: ColumnDef<WaitlistColumn>[] = [
  {
    accessorKey: "ProgCode",
    header: "Program",
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