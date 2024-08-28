import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const clinics = [
  { label: "Dry Land#1 Tuesday December 5th 2023 7pm Zoom", date: new Date("2023-12-05T19:00:00Z") },
  { label: "Dry Land#1 Thursday December 7th 2023 7pm Zoom", date: new Date("2023-12-07T19:00:00Z") },
  { label: "On Snow Clinic#1 Saturday December 9th 2023 9:30am Summit Central", date: new Date("2023-12-09T09:30:00Z") },
  { label: "On Snow Clinic#1 Sunday December 10th 2023 9:30am Summit Central", date: new Date("2023-12-10T09:30:00Z") },
  { label: "Dry Land#2 Tuesday December 12th 2023 7pm Zoom", date: new Date("2023-12-12T19:00:00Z") },
  { label: "Dry Land#2 Thursday December 14th 2023 7pm Zoom", date: new Date("2023-12-14T19:00:00Z") },
  { label: "On Snow Clinic#2 Saturday December 16th 2023 9:30am Summit Central", date: new Date("2023-12-16T09:30:00Z") },
  { label: "On Snow Clinic#2 Sunday December 17th 2023 9:30am Summit Central", date: new Date("2023-12-17T09:30:00Z") },
  { label: "Dry Land#3 Tuesday December 19th 2023 7pm Zoom", date: new Date("2023-12-19T19:00:00Z") },
  { label: "Dry Land#3 Thursday December 21st 2023 7pm Zoom", date: new Date("2023-12-21T19:00:00Z") },
  { label: "On Snow Clinic#3 Saturday December 30th 2023 9:30am Summit Central", date: new Date("2023-12-30T09:30:00Z") },
  { label: "On Snow Clinic#3 Sunday December 31st 2023 9:30am Summit Central", date: new Date("2023-12-31T09:30:00Z") },
  { label: "Dry Land#4 Tuesday January 2nd 2024 7pm Zoom", date: new Date("2024-01-02T19:00:00Z") },
  { label: "Dry Land#4 Thursday January 4th 2024 7pm Zoom", date: new Date("2024-01-04T19:00:00Z") },
  { label: "On Snow Clinic#4 Saturday January 6th 2024 9:30am Summit Central", date: new Date("2024-01-06T09:30:00Z") },
  { label: "On Snow Clinic#4 Sunday January 7th 2024 9:30am Summit Central", date: new Date("2024-01-07T09:30:00Z") },
];

async function main() {
  for (const clinic of clinics) {
    await prisma.clinic.create({
      data: {
        name: clinic.label,
        date: clinic.date,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
