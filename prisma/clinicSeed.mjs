import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const clinics = [
  { label: "Dry Land#1 Tuesday December 3rd 2024 7pm Zoom", date: new Date("2024-12-03T19:00:00Z") },
  { label: "Dry Land#1 Thursday December 5th 2024 7pm Zoom", date: new Date("2024-12-05T19:00:00Z") },
  { label: "On Snow Clinic#1 Saturday December 7th 2024 9:30am Summit Central", date: new Date("2024-12-07T09:30:00Z") },
  { label: "On Snow Clinic#1 Sunday December 8th 2024 9:30am Summit Central", date: new Date("2024-12-08T09:30:00Z") },
  { label: "Dry Land#2 Tuesday December 10th 2024 7pm Zoom", date: new Date("2024-12-10T19:00:00Z") },
  { label: "Dry Land#2 Thursday December 12th 2024 7pm Zoom", date: new Date("2024-12-12T19:00:00Z") },
  { label: "On Snow Clinic#2 Saturday December 14th 2024 9:30am Summit Central", date: new Date("2024-12-14T09:30:00Z") },
  { label: "On Snow Clinic#2 Sunday December 15th 2024 9:30am Summit Central", date: new Date("2024-12-15T09:30:00Z") },
  { label: "Dry Land#3 Tuesday December 17th 2024 7pm Zoom", date: new Date("2024-12-17T19:00:00Z") },
  { label: "Dry Land#3 Thursday December 19th 2024 7pm Zoom", date: new Date("2024-12-19T19:00:00Z") },
  { label: "On Snow Clinic#3 Saturday December 21st 2024 9:30am Summit Central", date: new Date("2024-12-21T09:30:00Z") },
  { label: "On Snow Clinic#3 Sunday December 22nd 2024 9:30am Summit Central", date: new Date("2024-12-22T09:30:00Z") },
  { label: "Dry Land#4 Tuesday January 2nd 2025 7pm Zoom", date: new Date("2025-01-02T19:00:00Z") },
  { label: "On Snow Clinic#4 Saturday December 28th 2024 9:30am Summit Central", date: new Date("2024-12-28T09:30:00Z") },
  { label: "On Snow Clinic#4 Sunday December 29th 2024 9:30am Summit Central", date: new Date("2024-12-29T09:30:00Z") },
];

async function main() {
  // Clear the Clinic table
  await prisma.clinic.deleteMany({});

  // Reset the auto-increment counter for MySQL
  await prisma.$executeRaw`ALTER TABLE Clinic AUTO_INCREMENT = 1;`;

  // Insert the new clinics
  for (const clinic of clinics) {
    await prisma.clinic.create({
      data: {
        name: clinic.label,
        date: clinic.date,
      },
    });
  }

  console.log("Clinics have been updated and IDs have been reset!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
