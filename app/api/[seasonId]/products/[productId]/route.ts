import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: params.productId
      },
      include: {
        program: {
          select: {
            imageUrl: true, // Select the imageUrl from the Program
          },
        },
        type: true,
      }
    });
  
    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


export async function DELETE(
  req: Request,
  { params }: { params: { productId: string, storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
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

    const product = await prismadb.product.delete({
      where: {
        id: params.productId
      },
    });
  
    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


export async function PATCH(
  req: Request,
  { params }: { params: { productId: string, seasonId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { title, name, price, programId, typeId, isFeatured, isArchived, quantity } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (quantity === undefined || quantity < 0) {
      return new NextResponse("Valid quantity is required", { status: 400 });
    }

    if (!price) {
      return new NextResponse("Price is required", { status: 400 });
    }

    if (!programId) {
      return new NextResponse("Program id is required", { status: 400 });
    }

    if (!typeId) {
      return new NextResponse("Type id is required", { status: 400 });
    }

    // Optional: Check if the product belongs to the user’s season
    // const seasonByUserId = await prismadb.season.findFirst({
    //   where: {
    //     id: params.seasonId,
    //     userId
    //   }
    // });

    // if (!seasonByUserId) {
    //   return new NextResponse("Unauthorized", { status: 405 });
    // }

    // Update the product with quantity
    await prismadb.product.update({
      where: {
        id: params.productId
      },
      data: {
        title,
        name,
        price,
        programId,
        typeId,
        isFeatured,
        isArchived,
        quantity, // Updated to include quantity
      },
    });

    return new NextResponse("Product updated successfully", { status: 200 });
  } catch (error) {
    console.log('[PRODUCT_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
