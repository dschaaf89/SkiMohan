import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';

export async function POST(
  req: Request,
  { params }: { params: { seasonId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { title, name, price, programId, typeId, quantity, isFeatured, isArchived } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

 
    if (!price) {
      return new NextResponse("Price is required", { status: 400 });
    }

    if (!programId) {
      return new NextResponse("program id is required", { status: 400 });
    }

    if (!typeId) {
      return new NextResponse("Size id is required", { status: 400 });
    }

    if (!params.seasonId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    

    const product = await prismadb.product.create({
      data: {
        title,
        name,
        price,
        isFeatured,
        isArchived,
        programId,
        typeId,
        quantity, // Add the quantity field here
        // Removed the images relation since images are no longer directly associated with Product
      },
    });
    
  
    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCTS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function GET(
  req: Request,
  { params }: { params: { seasonId: string } },
) {
  try {
    const { searchParams } = new URL(req.url);
    const programId = searchParams.get('programId') || undefined;
    const typeId = searchParams.get('typeId') || undefined;
    const isFeatured = searchParams.get('isFeatured');

    if (!params.seasonId) {
      return new NextResponse("Season id is required", { status: 400 });
    }

    const products = await prismadb.product.findMany({
      where: {
        programId,
        typeId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
      },
      include: {
        program: {
          select: {
            imageUrl: true, // Select the imageUrl from the Program
          },
        },
        type: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
  
    return NextResponse.json(products);
  } catch (error) {
    console.log('[PRODUCTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};