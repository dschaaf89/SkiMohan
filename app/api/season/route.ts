import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function POST(
  req:Request
  ) {
  try {
    const { userId }= auth();
    const body = await req.json();

    const { name }= body;

    if(!userId){
      return new NextResponse("unauthorized", {status: 401});
    }
    if (!name){
      return new NextResponse("name is required",{status:400});
    }
    const season = await prismadb.season.create({
      data: {
        name,
        userId
      }
    });
    return NextResponse.json(season);
  } catch (error) {
    console.log('[SEASON_POST]', error);
    return new NextResponse("Internal error", {status:500});
  }
}