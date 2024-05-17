import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";

export async function GET(
  req: Request,
  { params }: { params: { typeId: string } }
) {
  try {
    if (!params.typeId) {
      return new NextResponse("type id is required", { status: 400 });
    }

    const type = await prismadb.type.findUnique({
      where: {
        id: params.typeId
      }
    });
  
    return NextResponse.json(type);
  } catch (error) {
    console.log('[type_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { typeId: string, seasonId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.typeId) {
      return new NextResponse("type id is required", { status: 400 });
    }

    // const storeByUserId = await prismadb.seasonId.findFirst({
    //   where: {
    //     id: params.storeId,
    //     userId
    //   }
    // });

    // if (!storeByUserId) {
    //   return new NextResponse("Unauthorized", { status: 405 });
    // }

    const type = await prismadb.type.delete({
      where: {
        id: params.typeId
      }
    });
  
    return NextResponse.json(type);
  } catch (error) {
    console.log('[type_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


export async function PATCH(
  req: Request,
  { params }: { params: { typeId: string, seasonId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { name, value } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!value) {
      return new NextResponse("Value is required", { status: 400 });
    }


    if (!params.typeId) {
      return new NextResponse("type id is required", { status: 400 });
    }

    // const storeByUserId = await prismadb.season.findFirst({
    //   where: {
    //     id: params.storeId,
    //     userId
    //   }
    // });

    // if (!storeByUserId) {
    //   return new NextResponse("Unauthorized", { status: 405 });
    // }

    const type = await prismadb.type.update({
      where: {
        id: params.typeId
      },
      data: {
        name,
        value
      }
    });
  
    return NextResponse.json(type);
  } catch (error) {
    console.log('[type_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};