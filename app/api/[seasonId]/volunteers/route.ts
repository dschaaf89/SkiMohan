import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prisma from '@/lib/prismadb'; // Ensure you have set up your Prisma client correctly

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Change '*' to your domain if needed
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function POST(req: Request, { params }: { params: { seasonId: string } }) {
  try {
    const { userId } = auth(); // Ensure authentication is set up to extract userId

    const body = await req.json(); // Parse the JSON body

    console.log("Parsed Request Body:", body); // Log the parsed body

    const {
      firstName,
      lastName,
      birthDate,
      homePhone,
      mobilePhone,
      workPhone,
      Address,
      city,
      state,
      zipCode,
      email,
      employerSchool,
      occupationGrade,
      isGreeter,
      isProgramCoordinator,
      isBusChaperone,
      busChaperoneSchool,
      isEmergencyDriver,
      emergencyDriverDay,
      agreeToTerms,
      busChaperoneWk1,
      busChaperoneWk2,
      busChaperoneWk3,
      busChaperoneWk4,
      busChaperoneWk5,
      busChaperoneWk6,
      emergencyDriverWk1,
      emergencyDriverWk2,
      emergencyDriverWk3,
      emergencyDriverWk4,
      emergencyDriverWk5,
      emergencyDriverWk6,
      GreetTimeSlot,
      WSPRecieved,
    } = body;

    // Authentication and Authorization checks
    // if (!userId) {
    //   console.error("Unauthenticated request");
    //   return new NextResponse("Unauthenticated", { status: 403, headers: corsHeaders });
    // }

    // Validation of required fields
    if (!firstName || !lastName || !birthDate || !mobilePhone || !Address || !city || !state || !zipCode || !email) {
      console.error("Missing required fields");
      return new NextResponse("Missing required fields", { status: 400, headers: corsHeaders });
    }

    // Optional: Validate that the season exists and user has rights to add volunteers
    const season = await prisma.season.findUnique({
      where: { id: params.seasonId },
    });
    if (!season) {
      console.error("Season not found");
      return new NextResponse("Season not found", { status: 404, headers: corsHeaders });
    }

    // Create the volunteer in the database
    console.log("Creating volunteer in the database...");
    const newVolunteer = await prisma.volunteer.create({
      data: {
        firstName,
        lastName,
        birthDate: new Date(birthDate),
        homePhone,
        mobilePhone,
        workPhone,
        Address,
        city,
        state,
        zipCode,
        email,
        employerSchool,
        occupationGrade,
        isGreeter,
        isProgramCoordinator,
        isBusChaperone,
        busChaperoneSchool,
        isEmergencyDriver,
        emergencyDriverDay,
        agreeToTerms,
        busChaperoneWk1,
        busChaperoneWk2,
        busChaperoneWk3,
        busChaperoneWk4,
        busChaperoneWk5,
        busChaperoneWk6,
        emergencyDriverWk1,
        emergencyDriverWk2,
        emergencyDriverWk3,
        emergencyDriverWk4,
        emergencyDriverWk5,
        emergencyDriverWk6,
        GreetTimeSlot,
        WSPRecieved,
        seasonId: params.seasonId,
      },
    });
    console.log("Volunteer created:", newVolunteer);

    return new NextResponse(JSON.stringify(newVolunteer), { status: 201, headers: corsHeaders });
  } catch (error: any) {
    console.error('[POST Volunteer Error]', error);
    
    // Specific error handling for Prisma known errors
    if (error.code && error.code === 'P2002') {
      return new NextResponse("A volunteer with the same unique field already exists.", { status: 409, headers: corsHeaders });
    }

    return new NextResponse("Internal server error", { status: 500, headers: corsHeaders });
  }
}
