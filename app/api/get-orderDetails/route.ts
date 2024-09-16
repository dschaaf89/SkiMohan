import prismadb from '@/lib/prismadb';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { sessionId } = await req.json();  // Extract sessionId from the request body

        // Fetch the order based on the sessionId
        const order = await prismadb.order.findUnique({
            where: { sessionId },  // Query the order by sessionId
            select: {
                Name_First: true,
                Name_Last: true,
                phone: true,
                address: true,
                paymentMethod: true,
                transactionId:true,
                totalAmount: true,
                paymentDate: true,
            },
        });

        // Check if the order is found
        if (!order) {
            return new NextResponse('Order not found', { status: 404 });
        }

        // Return the fetched order details as JSON
        return NextResponse.json({ order });

    } catch (error) {
        // Handle any errors
        console.error('Error retrieving order details:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
