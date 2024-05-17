import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { StudentColumn } from "../students/components/columns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CoordinatorClient } from "./components/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChartComponent } from "@/components/BarChartComponent";
import { VolunteerColumn } from "../volunteers/components/columns";
import { VolunteerClient } from "../volunteers/components/client";




const coordinatorPortal = async ({
  params,
}: {
  params: { seasonId: string };
}) => {
  // Fetch students with any implied type
  const students = await prismadb.student.findMany({
    where: {
      seasonId: params.seasonId,
    },
  });

  const volunteers = await prismadb.volunteer.findMany({
    where:{
      seasonId:params.seasonId
    }
  })
  
  // Log out the ProgCodes to see if -TR codes are present
  console.log(students.map(student => student.ProgCode));
  
  const baseFridayProgCodes = [
    'ECKS-S', 'HAML-B', 'HAML-S', 'ECKS-B', 'BALL-S', 
    'JANE-S', 'ROOS-S', 'EAST-S', 'WHIT-B', 'BALL-B', 
    'EAST-B', 'LINC-S', 'WHIT-S', 'JANE-B', 'NATH-S',
    'NATH-B', 'ROOS-B', 'LINC-B',
  ];
  
  // Dynamically create the full list including both -LT and -T versions
  const fridayProgCodes = baseFridayProgCodes.reduce<string[]>((acc, code) => {
    acc.push(`${code}-LT`, `${code}-TR`);
    return acc;
  }, []);
  

  const fridayStudents = students.filter(student => student.DAY === 'Friday');


  console.log(fridayStudents.map(s => s.ProgCode));
  // Initialize counters
let transportationOnlyCount = 0;
let lessonsAndTransportationCount = 0;

// Count students in each category
fridayStudents.forEach(student => {
  if (student.ProgCode) {
    console.log(student.ProgCode); // Log the ProgCode to verify it's what you expect
    if (student.ProgCode.endsWith("-TR")) {
      transportationOnlyCount += 1;
    } else if (student.ProgCode.endsWith("-LT")) {
      lessonsAndTransportationCount += 1;
    }
  }
});

console.log('Total students fetched: ', students.length);
console.log('Total Friday students: ', fridayStudents.length);
console.log('Transportation Only ProgCodes: ', fridayStudents.filter(s => s.ProgCode?.endsWith('-TR')).map(s => s.ProgCode));
console.log('Lessons and Transportation ProgCodes: ', fridayStudents.filter(s => s.ProgCode?.endsWith('-LT')).map(s => s.ProgCode));

  const chartData = {
    labels: ['Transportation Only', 'Lessons and Transportation'],
    datasets: [
      {
        label: 'Number of Students',
        data: [transportationOnlyCount, lessonsAndTransportationCount],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)'
        ],
      },
    ],
  };

  const waitlistStudents = await prismadb.student.findMany({
    where: {
      seasonId: params.seasonId,
      status: 'Waitlist',  // Filtering by 'Waitlist' status
    },
  });

  const formattedWaitlistStudents: StudentColumn[] = waitlistStudents.map((item) => ({
    id: item.id,
    UniqueID: item.UniqueID || "",
    NAME_FIRST: item.NAME_FIRST || "",
    NAME_LAST: item.NAME_LAST || "",
    HOME_TEL: item.HOME_TEL || "",
    ADDRESS: item.ADDRESS || "",
    CITY: item.CITY || "",
    STATE: item.STATE || "",
    ZIP: item.ZIP || "",
    student_tel: item.student_tel || "", // Assuming this field is present in your document
    Email_student: item.Email_student || "",
    BRTHD: item.BRTHD ? format(new Date(item.BRTHD), "MM/dd/yyyy") : "",
    AGE: item.AGE, // Assuming this field is present in your document and corresponds to DOB
    GradeLevel: item.GradeLevel || "",
    APPLYING_FOR: item.APPLYING_FOR || "",
    LEVEL: item.LEVEL || "",
    Approach: item.Approach || "",
    E_mail_main: item.E_mail_main || "", // Assuming this field is present in your document
    E_NAME: item.E_NAME || "", // Assuming this field is present in your document
    E_TEL: item.E_TEL || "", // Assuming this field is present in your document
    CCPayment: item.CCPayment || "", // Assuming this field is present in your document
    ProgCode: item.ProgCode || "",
    BUDDY: item.BUDDY || "",
    WComment: item.WComment || "",
    DateFeePaid: item.DateFeePaid || "",
    PaymentStatus: item.PaymentStatus || "", // Assuming this field is present in your document
    AcceptedTerms: item.AcceptedTerms || "", // Assuming this field is present in your document
    AppType: item.AppType || 0, // Assuming this field is present in your document
    Employer: item.Employer || "", // Assuming this field is present in your document
    C_TEL: item.C_TEL || "", // Assuming this field is present in your document
    Occupation: item.Occupation || "", // Assuming this field is present in your document
    W_TEL: item.W_TEL || "", // Assuming this field is present in your document
    AGE_GROUP: item.AGE_GROUP || 0, // Optional field (not present in your Prisma model
    GENDER: item.GENDER || "",
    FeeComment: item.FeeComment || "",
    AGRESSIVENESS: item.AGRESSIVENESS || "",
    DAY: item.DAY || "",
    StartTime: item.StartTime || "",
    EndTime: item.EndTime || "",
    classID: item.classID || 0, // Assign null if undefined
    meetingPoint: item.meetingPoint !== undefined ? item.meetingPoint : null,
    meetColor: item.meetColor || null,
    updateAt: item.updateAt
      ? format(new Date(item.updateAt), "MM/dd/yyyy")
      : "",
    status: item.status,
  }));

  const formattedStudents: StudentColumn[] = fridayStudents.map((item) => ({
    id: item.id,
    UniqueID: item.UniqueID || "",
    NAME_FIRST: item.NAME_FIRST || "",
    NAME_LAST: item.NAME_LAST || "",
    HOME_TEL: item.HOME_TEL || "",
    ADDRESS: item.ADDRESS || "",
    CITY: item.CITY || "",
    STATE: item.STATE || "",
    ZIP: item.ZIP || "",
    student_tel: item.student_tel || "", // Assuming this field is present in your document
    Email_student: item.Email_student || "",
    BRTHD: item.BRTHD ? format(new Date(item.BRTHD), "MM/dd/yyyy") : "",
    AGE: item.AGE, // Assuming this field is present in your document and corresponds to DOB
    GradeLevel: item.GradeLevel || "",
    APPLYING_FOR: item.APPLYING_FOR || "",
    LEVEL: item.LEVEL || "",
    Approach: item.Approach || "",
    E_mail_main: item.E_mail_main || "", // Assuming this field is present in your document
    E_NAME: item.E_NAME || "", // Assuming this field is present in your document
    E_TEL: item.E_TEL || "", // Assuming this field is present in your document
    CCPayment: item.CCPayment || "", // Assuming this field is present in your document
    ProgCode: item.ProgCode || "",
    BUDDY: item.BUDDY || "",
    WComment: item.WComment || "",
    DateFeePaid: item.DateFeePaid || "",
    PaymentStatus: item.PaymentStatus || "", // Assuming this field is present in your document
    AcceptedTerms: item.AcceptedTerms || "", // Assuming this field is present in your document
    AppType: item.AppType || 0, // Assuming this field is present in your document
    Employer: item.Employer || "", // Assuming this field is present in your document
    C_TEL: item.C_TEL || "", // Assuming this field is present in your document
    Occupation: item.Occupation || "", // Assuming this field is present in your document
    W_TEL: item.W_TEL || "", // Assuming this field is present in your document
    AGE_GROUP: item.AGE_GROUP || 0, // Optional field (not present in your Prisma model
    GENDER: item.GENDER || "",
    FeeComment: item.FeeComment || "",
    AGRESSIVENESS: item.AGRESSIVENESS || "",
    DAY: item.DAY || "",
    StartTime: item.StartTime || "",
    EndTime: item.EndTime || "",
    classID: item.classID || 0, // Assign null if undefined
    meetingPoint: item.meetingPoint !== undefined ? item.meetingPoint : null,
    meetColor: item.meetColor || null,
    updateAt: item.updateAt
      ? format(new Date(item.updateAt), "MM/dd/yyyy")
      : "",
    status: item.status,
  }));

  const formattedVolunteers: VolunteerColumn[] = volunteers.map((item) => ({
    id:item.id,
    firstName: item.firstName,
    lastName: item.lastName,
    birthDate: item.birthDate,
    homePhone: item.homePhone || null,
    mobilePhone: item.mobilePhone,
    workPhone: item.workPhone || null,
    Address: item.Address,
    city: item.city,
    state: item.state,
    zipCode: item.zipCode,
    email: item.email,
    employerSchool: item.employerSchool || null,
    occupationGrade: item.occupationGrade || null,
    isGreeter: item.isGreeter,
    isProgramCoordinator: item.isProgramCoordinator,
    isBusChaperone: item.isBusChaperone,
    busChaperoneSchool: item.busChaperoneSchool || null,
    isEmergencyDriver: item.isEmergencyDriver,
    emergencyDriverDay: item.emergencyDriverDay || null,
    applicantStatus: item.applicantStatus as "Returning" | "New", // Type assertion
    agreeToTerms: item.agreeToTerms,
    busChaperoneWk1: item.busChaperoneWk1,
    busChaperoneWk2: item.busChaperoneWk2,
    busChaperoneWk3: item.busChaperoneWk3,
    busChaperoneWk4: item.busChaperoneWk4,
    busChaperoneWk5: item.busChaperoneWk5,
    busChaperoneWk6: item.busChaperoneWk6,
    emergencyDriverWk1: item.emergencyDriverWk1,
    emergencyDriverWk2: item.emergencyDriverWk2,
    emergencyDriverWk3: item.emergencyDriverWk3,
    emergencyDriverWk4: item.emergencyDriverWk4,
    emergencyDriverWk5: item.emergencyDriverWk5,
    emergencyDriverWk6: item.emergencyDriverWk6,
  }));

 
  const formattedVolunteersWk1 = formattedVolunteers.filter(
    (volunteer) => volunteer.busChaperoneWk1 || volunteer.emergencyDriverWk1
  );

  const formattedVolunteersWk2 = formattedVolunteers.filter(
    (volunteer) => volunteer.busChaperoneWk2 || volunteer.emergencyDriverWk2
  );

  const formattedVolunteersWk3 = formattedVolunteers.filter(
    (volunteer) => volunteer.busChaperoneWk3 || volunteer.emergencyDriverWk3
  );

  const formattedVolunteersWk4 = formattedVolunteers.filter(
    (volunteer) => volunteer.busChaperoneWk4 || volunteer.emergencyDriverWk4
  );

  const formattedVolunteersWk5 = formattedVolunteers.filter(
    (volunteer) => volunteer.busChaperoneWk5 || volunteer.emergencyDriverWk5
  );

  const formattedVolunteersWk6 = formattedVolunteers.filter(
    (volunteer) => volunteer.busChaperoneWk6 || volunteer.emergencyDriverWk6
  );

  return (
    <>
      <div>
        <h1 className="text text-4xl text-center">
          &quot;Program NAME&quot; Coordinator Portal
        </h1>
      </div>
      <div className="grid grid-cols-2 gap-4 p-8 pt-6">
        {/* Student Alpha Roster */}
        <div className="bg-gray-100 p-4 rounded-lg shadow">
          <Card>
            <CardHeader>
              <h1 className="font-bold text-center">
                Student Roster <br />
                <br /> ({formattedStudents.length}){" "}
              </h1>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chart" className="">
                <TabsList>
                  <TabsTrigger value="chart">Chart</TabsTrigger>
                  <TabsTrigger value="roster">Roster</TabsTrigger>
                </TabsList>
                <TabsContent value="chart">
                  <BarChartComponent data={chartData} />
                </TabsContent>
                <TabsContent value="roster">
                  <CoordinatorClient data={formattedStudents} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Waitlist */}
        <div className="bg-gray-100 p-4 rounded-lg shadow">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Bus Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Bus Company:</p>
              <p>Bus Driver:</p>
              <p>Bus Driver Phone Number:</p>
              <p>Pick Up Location:</p>
              <p>Pick Up Time:</p>
              <p>Drop Off Time:</p>

              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <p>Any other bus related information</p>
            </CardContent>
          </Card>
        </div>

        {/* Volunteer Roster */}
        <div className="bg-gray-100 p-4 rounded-lg shadow">
          <Card>
            <CardHeader>
            </CardHeader>
            <CardContent>
            <Tabs defaultValue="chart" className="">
                <TabsList>
                  <TabsTrigger value="Week1">Week 1</TabsTrigger>
                  <TabsTrigger value="Week2">Week 2</TabsTrigger>
                  <TabsTrigger value="Week3">Week 3</TabsTrigger>
                  <TabsTrigger value="Week4">Week 4</TabsTrigger>
                  <TabsTrigger value="Week5">Week 5</TabsTrigger>
                  <TabsTrigger value="Week6">Week 6</TabsTrigger>
                  
                </TabsList>
                <TabsContent value="Week1">
                  <VolunteerClient data={formattedVolunteersWk1} />
                </TabsContent>
                <TabsContent value="Week2">
                  <VolunteerClient data={formattedVolunteersWk2} />
                </TabsContent>
                <TabsContent value="Week3">
                  <VolunteerClient data={formattedVolunteersWk3} />
                </TabsContent>
                <TabsContent value="Week4">
                  <VolunteerClient data={formattedVolunteersWk4} />
                </TabsContent>
                <TabsContent value="Week5">
                  <VolunteerClient data={formattedVolunteersWk5} />
                </TabsContent>
                <TabsContent value="Week6">
                  <VolunteerClient data={formattedVolunteersWk6} />
                </TabsContent>

              </Tabs>
            </CardContent>
            <CardFooter>
              <p>Card Footer</p>
            </CardFooter>
          </Card>
        </div>

        {/* Bus Information */}
        <div className="bg-gray-100 p-4 rounded-lg shadow">
          <Card>
            <CardHeader>
              <CardTitle>Waitlist Roster</CardTitle>
            </CardHeader>
            <CardContent>
               <CoordinatorClient data={formattedWaitlistStudents} />
            </CardContent>
            <CardFooter>s
            </CardFooter>
          </Card>
        </div>
        <div className="col-span-2 bg-gray-100 p-4 rounded-lg shadow text-center">
        <Card>
            <CardHeader>
              <CardTitle>Document Center</CardTitle>
            </CardHeader>
            <CardContent>
               <p>Documents</p>
            </CardContent>
            <CardFooter>s
            </CardFooter>
          </Card>
          <p className="text-lg font-semibold">
            Questions? Please Contact your Program&apos;s Coordinator Coordinator:
          </p>
          <p>Sara Schaaf</p>
          <p>Phone: 253-290-9926</p>
          <p>Email: office@skimohan.com</p>
        </div>
        
      </div>
    </>
  );
};

export default coordinatorPortal;
