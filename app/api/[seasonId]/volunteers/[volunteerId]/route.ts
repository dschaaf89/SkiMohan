import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { volunteerId: string } }
) {
  try {
    const { userId } = auth(); // Ensure the user is authenticated

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.volunteerId) {
      return new NextResponse("Volunteer ID is required", { status: 400 });
    }

    const volunteer = await prismadb.volunteer.findUnique({
      where: { id: params.volunteerId }
    });

    if (!volunteer) {
      return new NextResponse("Volunteer not found", { status: 404 });
    }

    return new NextResponse(JSON.stringify(volunteer), { status: 200 });
  } catch (error) {
    console.error('[Volunteer_GET] Error:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { volunteerId: string, seasonId: string } }
) {
  try {
    const { userId } = auth(); // Authenticate and possibly authorize the user

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.volunteerId) {
      return new NextResponse("Volunteer ID is required", { status: 400 });
    }



    const deletedVolunteer = await prismadb.volunteer.delete({
      where: { id: params.volunteerId }
    });

    return new NextResponse(JSON.stringify(deletedVolunteer), { status: 200 });
  } catch (error) {
    console.error('[Volunteer_DELETE] Error:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


export async function PATCH(
  req: Request,
  { params }: { params: { volunteerId: string, seasonId: string } }
) {
  try {
    const { userId } = auth(); // Ensure the user is authenticated

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.volunteerId || !params.seasonId) {
      return new NextResponse("Volunteer and Season ID are required", { status: 400 });
    }

    const body = await req.json();
    const {
      firstName, lastName, birthDate, homePhone, mobilePhone, workPhone,
      Address, city, state, zipCode, email, employerSchool, occupationGrade,
      isGreeter, isProgramCoordinator, isBusChaperone, busChaperoneSchool,
      isEmergencyDriver, emergencyDriverDay, applicantStatus, agreeToTerms, busChaperoneWk1,
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

    // Perform additional validations as needed
    if (!firstName || !lastName || !email) {
      return new NextResponse("Required fields are missing", { status: 400 });
    }

    const updatedVolunteer = await prismadb.volunteer.update({
      where: { id: params.volunteerId },
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
        seasonId: params.seasonId // Ensure seasonId is maintained or updated appropriately
      }
    });

    return new NextResponse(JSON.stringify({ message: "Volunteer updated successfully", volunteer: updatedVolunteer }), { status: 200 });
  } catch (error) {
    console.error('[Volunteer_PATCH] Error:', error);
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
