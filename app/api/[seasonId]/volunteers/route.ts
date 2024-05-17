// File: routes/volunteers.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prisma from '@/lib/prismadb'; // Ensure you have set up your Prisma client correctly

export async function POST(
  req: Request,
  { params }: { params: { seasonId: string } }
) {
  try {
    const { userId } = auth(); // Ensure authentication is set up to extract userId
    const body = await req.json();

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
      applicantStatus,
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
    } = body;

    // Authentication and Authorization checks
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Validation of required fields
    if (!firstName || !lastName || !birthDate || !mobilePhone || !Address || !city || !state || !zipCode || !email ) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Optional: Validate that the season exists and user has rights to add volunteers
    const season = await prisma.season.findUnique({
      where: { id: params.seasonId },
    });
    if (!season) {
      return new NextResponse("Season not found", { status: 404 });
    }

    // Create the volunteer in the database
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
        applicantStatus,
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
        seasonId: params.seasonId,
      },
    });

    return new NextResponse(JSON.stringify(newVolunteer), { status: 201 });
  } catch (error) {
    console.error('[POST Volunteer Error]', error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
