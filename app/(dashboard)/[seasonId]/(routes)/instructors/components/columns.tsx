"use client"

import { ColumnDef } from "@tanstack/react-table"

export type InstructorColumn = {
  UniqueID: number;
  NAME_FIRST: string;
  NAME_LAST: string;
  HOME_TEL: string;
  E_MAIL: string;
  C_TEL: string;
  BRTHD: string | Date;
  E_mail_main: string;
  ADDRESS: string;
  CITY: string;
  STATE: string;
  ZIP: string;
  Employer: string;
  Occupation: string;
  W_Tel: string;
  CCPayment: string;
  DateFeePaid: string | Date;
  PSIAcertification: number;
  AASIcertification: number;
  NumDays: number;
  ApplyingFor: number;
  PaymentStatus: string;
  PROG_CODE: string;
  Clinic1: number;
  Clinic2: number;
  Clinic3: number;
  Clinic4: number;
  Clinic5: number;
  Clinic6: number;
  AcceptedTerms: boolean;
  Schedule1: boolean;
  Schedule2: boolean;
  Schedule3: boolean;
  Schedule4: boolean;
  Schedule5: boolean;
  Schedule6: boolean;
  Schedule7: boolean;
  Schedule8: boolean;
  Schedule9: boolean;
  WComment: string;
  returning: boolean;
  createAt: Date;
  updateAt: Date;
}



export const columns: ColumnDef<InstructorColumn>[] = [
  {
    accessorKey: "UniqueID",
    header: "ID",
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
    header: "Home Telephone",
  },
  {
    accessorKey: "E_MAIL",
    header: "Email",
  },
  {
    accessorKey: "C_TEL",
    header: "Contact Telephone",
  },
  {
    accessorKey: "BRTHD",
    header: "Birth Date",
  },
  {
    accessorKey: "E_mail_main",
    header: "Main Email",
  },
  {
    accessorKey: "ADDRESS",
    header: "Address",
  },
  {
    accessorKey: "CITY",
    header: "City",
  },
  {
    accessorKey: "STATE",
    header: "State",
  },
  {
    accessorKey: "ZIP",
    header: "ZIP",
  },
  {
    accessorKey: "Employer",
    header: "Employer",
  },
  {
    accessorKey: "Occupation",
    header: "Occupation",
  },
  {
    accessorKey: "W_Tel",
    header: "Work Telephone",
  },
  {
    accessorKey: "CCPayment",
    header: "Credit Card Payment",
  },
  {
    accessorKey: "DateFeePaid",
    header: "Date Fee Paid",
  },
  {
    accessorKey: "PSIAcertification",
    header: "PSIA Certification",
  },
  {
    accessorKey: "AASIcertification",
    header: "AASI Certification",
  },
  {
    accessorKey: "NumDays",
    header: "Number of Days",
  },
  {
    accessorKey: "ApplyingFor",
    header: "Applying For",
  },
  {
    accessorKey: "PaymentStatus",
    header: "Payment Status",
  },
  {
    accessorKey: "PROG_CODE",
    header: "Program Code",
  },
  {
    accessorKey: "Clinic1",
    header: "Clinic 1",
  },
  {
    accessorKey: "Clinic2",
    header: "Clinic 2",
  },
  {
    accessorKey: "Clinic3",
    header: "Clinic 3",
  },
  {
    accessorKey: "Clinic4",
    header: "Clinic 4",
  },
  {
    accessorKey: "Clinic5",
    header: "Clinic 5",
  },
  {
    accessorKey: "Clinic6",
    header: "Clinic 6",
  },
  {
    accessorKey: "AcceptedTerms",
    header: "Accepted Terms",
    cell: info => info.getValue() ? "Yes" : "No",
  },
  {
    accessorKey: "Schedule1",
    header: "Schedule 1",
    cell: info => info.getValue() ? "Yes" : "No",
  },
  {
    accessorKey: "Schedule2",
    header: "Schedule 2",
    cell: info => info.getValue() ? "Yes" : "No",
  },
  {
    accessorKey: "Schedule3",
    header: "Schedule 3",
    cell: info => info.getValue() ? "Yes" : "No",
  },
  {
    accessorKey: "Schedule4",
    header: "Schedule 4",
    cell: info => info.getValue() ? "Yes" : "No",
  },
  {
    accessorKey: "Schedule5",
    header: "Schedule 5",
    cell: info => info.getValue() ? "Yes" : "No",
  },
  {
    accessorKey: "Schedule6",
    header: "Schedule 6",
    cell: info => info.getValue() ? "Yes" : "No",
  },
  {
    accessorKey: "Schedule7",
    header: "Schedule 7",
    cell: info => info.getValue() ? "Yes" : "No",
  },
  {
    accessorKey: "Schedule8",
    header: "Schedule 8",
    cell: info => info.getValue() ? "Yes" : "No",
  },
  {
    accessorKey: "Schedule9",
    header: "Schedule 9",
    cell: info => info.getValue() ? "Yes" : "No",
  },
  {
    accessorKey: "WComment",
    header: "Comment",
  },
  {
    accessorKey: "returning",
    header: "Returning",
    cell: info => info.getValue() ? "Yes" : "No",
  },
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


