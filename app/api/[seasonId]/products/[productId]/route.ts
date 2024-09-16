import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";

// GET product
export const GET = async (req: Request, { params }: { params: { productId: string } }) => {
  try {
    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const product = await prismadb.product.findUnique({
      where: { id: params.productId },
      include: {
        program: { select: { imageUrl: true } },
        type: true,
      },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Convert Decimal to number
    const productWithPlainPrice = {
      ...product,
      price: product.price.toNumber(),
    };

    return NextResponse.json(productWithPlainPrice);
  } catch (error) {
    console.log("[PRODUCT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

// DELETE product
export const DELETE = async (req: Request, { params }: { params: { productId: string } }) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const product = await prismadb.product.delete({
      where: { id: params.productId },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Convert Decimal to number
    const productWithPlainPrice = {
      ...product,
      price: product.price.toNumber(),
    };

    return NextResponse.json(productWithPlainPrice);
  } catch (error) {
    console.log("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

// PATCH product
export const PATCH = async (req: Request, { params }: { params: { productId: string } }) => {
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

    if (!price || isNaN(price)) {
      return new NextResponse("Price must be a valid number", { status: 400 });
    }

    if (!programId) {
      return new NextResponse("Program id is required", { status: 400 });
    }

    if (!typeId) {
      return new NextResponse("Type id is required", { status: 400 });
    }

    const updatedProduct = await prismadb.product.update({
      where: { id: params.productId },
      data: {
        title,
        name,
        price: new Prisma.Decimal(price),
        programId,
        typeId,
        isFeatured,
        isArchived,
        quantity,
      },
    });

    // Convert Decimal to number
    const productWithPlainPrice = {
      ...updatedProduct,
      price: updatedProduct.price.toNumber(),
    };

    return NextResponse.json(productWithPlainPrice);
  } catch (error) {
    console.log("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
