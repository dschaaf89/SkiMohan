import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const classes = [
  { label: "Thursday 7:00pm-9:00pm", day: "Thursday", startTime: "19:00", endTime: "21:00" },
  { label: "Friday 7:00pm-9:00pm", day: "Friday", startTime: "19:00", endTime: "21:00" },
  { label: "Saturday 1 10:30am-12:30pm", day: "Saturday", startTime: "10:30", endTime: "12:30" },
  { label: "Saturday 2 2:00pm-4:00pm", day: "Saturday", startTime: "14:00", endTime: "16:00" },
  { label: "Sunday 1 10:30am-12:30pm", day: "Sunday", startTime: "10:30", endTime: "12:30" },
  { label: "Sunday 2 2:00pm-4:00pm", day: "Sunday", startTime: "14:00", endTime: "16:00" },
];

async function main() {
  for (const classTime of classes) {
    await prisma.classTime.create({
      data: {
        label: classTime.label,
        day: classTime.day,
        startTime: new Date(`2024-01-01T${classTime.startTime}:00.000Z`),
        endTime: new Date(`2025-01-01T${classTime.endTime}:00.000Z`),
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



  // use node prisma/seed.mjs to seed the database classTime table.
