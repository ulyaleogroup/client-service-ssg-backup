import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams
        const page = searchParams.get('page')
        const pageSize = 10; // Jumlah data per halaman
        const offset = pageSize * (Number(page) - 1)
        const rowsData = await prisma.memberDetail.count()
        const totalPage = Math.ceil(rowsData / pageSize);


        const members = await prisma.memberDetail.findMany({
            skip: offset,
            take: pageSize,
            where: {
                isActive: true
            },
            select: {
                id: true,
                telegramId: true,
                transactionId: true,
                createdAt: true,
                expireAt: true,
                transaction: {
                    select: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        const formattedMembers = members.map(member => {
            return {
                id: member.id,
                telegramId: member.telegramId,
                transactionId: member.transactionId,
                createdAt: member.createdAt,
                expireAt: member.expireAt,
                name: member.transaction.user.name // Mengambil nama user dari transaction
            };
        });


        return NextResponse.json({
            status: 200,
            message: "ok",
            data: formattedMembers,
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