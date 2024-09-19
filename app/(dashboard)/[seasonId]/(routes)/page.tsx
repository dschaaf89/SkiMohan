// Server Component with Bar Charts
import { BarChartComponent } from '@/components/BarChartComponent';
import prismadb from '@/lib/prismadb';
import {
  fridayNightPrograms,
  saturdayPrograms,
  sundayPrograms,
} from '@/app/(dashboard)/[seasonId]/(routes)/students/[studentId]/components/programDropdown'; // Adjust the import path as needed

// Main Dashboard Component
const DashboardPage = async ({ params }) => {
  // Fetch LT and LO students data
  const ltLoStudents = await fetchLtLoStudents(params.seasonId);
  const ltLoStats = calculateLtLoStats(ltLoStudents);

  // Fetch TR students data
  const trStudents = await fetchTrStudents(params.seasonId);
  const trStats = calculateTrStats(trStudents);

  // Fetch Waitlist students data
  const waitlistStudents = await fetchWaitlistStudents(params.seasonId);
  const waitlistStats = calculateWaitlistStats(waitlistStudents);

  // Fetch Instructor data
  const instructors = await fetchInstructors(params.seasonId);
  const instructorStats = calculateInstructorStats(instructors);

  // Fetch Assistant data
  const assistants = await fetchAssistants(params.seasonId);
  const assistantStats = calculateAssistantStats(assistants);

  // Chart data for LT and LO students
  const ltLoChartData = {
    labels: Object.keys(ltLoStats),
    datasets: [
      {
        label: 'LT and LO Students per Day',
        data: Object.values(ltLoStats).map((value) => Number(value)),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  // Chart data for TR students
  const trChartData = {
    labels: Object.keys(trStats),
    datasets: [
      {
        label: 'Transportation Students by Program Code',
        data: Object.values(trStats).map((value) => Number(value)),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  // Chart data for Waitlist students
  const waitlistChartData = {
    labels: Object.keys(waitlistStats),
    datasets: [
      {
        label: 'Waitlisted Students by Program Code',
        data: Object.values(waitlistStats).map((value) => Number(value)),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  // Chart data for Instructors
  const instructorChartData = {
    labels: ['Pre-Registered', 'Registered'],
    datasets: [
      {
        label: 'Instructor Status',
        data: [instructorStats['Pre-Registered'], instructorStats['Registered']],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  // Chart data for Assistants
  const assistantChartData = {
    labels: ['Pre-Registered', 'Registered'],
    datasets: [
      {
        label: 'Assistant Status',
        data: [assistantStats['Pre-Registered'], assistantStats['Registered']],
        backgroundColor: 'rgba(255, 159, 64, 0.6)', // Different color for distinction
      },
    ],
  };

  return (
    <div className="charts-container">
      <h1>Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BarChartComponent data={ltLoChartData} />
        <BarChartComponent data={trChartData} />
        <BarChartComponent data={waitlistChartData} />
        <BarChartComponent data={instructorChartData} />
        <BarChartComponent data={assistantChartData} />
      </div>
    </div>
  );
};

// Function to fetch LT and LO students
const fetchLtLoStudents = async (seasonId) => {
  const ltStudents = await prismadb.student.findMany({
    where: {
      ProgCode: {
        contains: '-LT',
      },
      seasonId,
    },
  });

  const loStudents = await prismadb.student.findMany({
    where: {
      ProgCode: {
        contains: '-LO',
      },
      seasonId,
    },
  });

  return [...ltStudents, ...loStudents];
};

// Function to fetch TR students
const fetchTrStudents = async (seasonId) => {
  return await prismadb.student.findMany({
    where: {
      ProgCode: {
        contains: '-TR',
      },
      seasonId,
    },
  });
};

// Function to fetch Waitlist students
const fetchWaitlistStudents = async (seasonId) => {
  return await prismadb.student.findMany({
    where: {
      ProgCode: {
        in: fridayNightPrograms.map((program) => program.code),
      },
      seasonId,
      status: 'Waitlist',
    },
  });
};

// Function to fetch Instructors
const fetchInstructors = async (seasonId) => {
  return await prismadb.instructor.findMany({
    where: {
      seasonId,
      STATUS: {
        in: ['Pre-Registered', 'Registered'],
      },
      InstructorType: {
        in: ['Ski Instructor', 'Board Instructor', 'Ski and Board Instructor'],
      },
    },
  });
};

// Function to fetch Assistants
const fetchAssistants = async (seasonId) => {
  return await prismadb.instructor.findMany({
    where: {
      seasonId,
      STATUS: {
        in: ['Pre-Registered', 'Registered'],
      },
      InstructorType:{
        in:['Ski Assistant', 'Board Assistant', 'Ski and Board Assistant'],
      } },
  });
};

// Function to calculate LT and LO stats
const calculateLtLoStats = (students) => {
  const dayOrder = ['Friday', 'Saturday AM', 'Saturday PM', 'Sunday AM', 'Sunday PM'];

  return students.reduce((acc, student) => {
    const programDetails = getProgramDetails(student.ProgCode);

    if (programDetails) {
      let day = programDetails.day;
      const timeSlot = getTimeSlot(programDetails.startTime);

      if (day === 'Saturday' || day === 'Sunday') {
        day = `${day} ${timeSlot}`;
      }

      if (day !== 'Unknown') {
        acc[day] = (acc[day] || 0) + 1;
      }
    }

    acc = Object.keys(acc)
      .sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
      .reduce((obj, key) => {
        obj[key] = acc[key];
        return obj;
      }, {});

    return acc;
  }, {});
};

// Function to calculate TR stats
const calculateTrStats = (students) => {
  // Initialize stats with all Friday TR program codes set to zero
  const trPrograms = fridayNightPrograms
    .filter((program) => program.code.includes('-TR'))
    .reduce((acc, program) => {
      acc[program.code] = 0; // Set initial count to zero for each TR program code
      return acc;
    }, {});

  // Update stats based on actual transportation students
  students.forEach((student) => {
    const program = student.ProgCode;
    if (trPrograms.hasOwnProperty(program)) {
      trPrograms[program] += 1; // Increment count if the program code matches
    }
  });

  return trPrograms;
};

// Function to calculate Waitlist stats
const calculateWaitlistStats = (students) => {
  const stats = fridayNightPrograms.reduce((acc, program) => {
    acc[program.code] = 0;
    return acc;
  }, {});

  students.forEach((student) => {
    const program = student.ProgCode;
    stats[program] = (stats[program] || 0) + 1;
  });

  return stats;
};

// Function to calculate Instructor stats
const calculateInstructorStats = (instructors) => {
  const stats = {
    'Pre-Registered': 0,
    Registered: 0,
  };

  instructors.forEach((instructor) => {
    const status = instructor.STATUS;

    if (status === 'Pre-Registered' || status === 'Registered') {
      stats[status] = (stats[status] || 0) + 1;
    }
  });

  return stats;
};

// Function to calculate Assistant stats
const calculateAssistantStats = (assistants) => {
  const stats = {
    'Pre-Registered': 0,
    Registered: 0,
  };

  assistants.forEach((assistant) => {
    const status = assistant.STATUS;

    if (status === 'Pre-Registered' || status === 'Registered') {
      stats[status] = (stats[status] || 0) + 1;
    }
  });

  return stats;
};

// Function to get program details based on ProgCode
const getProgramDetails = (progCode) => {
  const allPrograms = [...fridayNightPrograms, ...saturdayPrograms, ...sundayPrograms];
  return allPrograms.find((program) => program.code === progCode);
};

// Function to determine timeslot based on specific start times
const getTimeSlot = (startTime) => {
  if (!startTime) return 'Unknown';
  if (startTime === '10:30 AM') return 'AM';
  if (startTime === '2:00 PM') return 'PM';
  return 'Unknown';
};

export default DashboardPage;
