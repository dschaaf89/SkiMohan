"use client"

import { ColumnDef } from "@tanstack/react-table"

export type WaitlistColumn = {
  id: string;
  NAME_FIRST: string;
  NAME_LAST: string;
  HOME_TEL: string;
  E_mail_main: string;
  ProgCode:string; // Assuming this is the correct field name for the main email
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