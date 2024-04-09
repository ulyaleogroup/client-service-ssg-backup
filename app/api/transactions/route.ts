import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams
        const page = searchParams.get('page')
        const pageSize = 10; // Jumlah data per halaman
        const offset = pageSize * (Number(page) - 1)
        const rowsData = await prisma.transaction.count()
        const totalPage = Math.ceil(rowsData / pageSize);


        const transactions = await prisma.transaction.findMany({
            skip: offset,
            take: pageSize,
            include: {
                user: true
            }
        });

        const transactionsData = transactions.map(transaction => ({
            ...transaction,
            price: transaction.price.toString() 
        }));


        return NextResponse.json({
            status: 200,
            message: "ok",
            data: transactionsData,
            metadata: {
                "totalItems": rowsData,
                "pageSize": pageSize,
                "currentPage": page,
                "totalPages": totalPage
            }
        }, { status: 200 })
    } catch (error) {
        console.log(error);

        return NextResponse.json({
            status: 500,
            message: "internal server error"
        }, { status: 500 })
    }
}