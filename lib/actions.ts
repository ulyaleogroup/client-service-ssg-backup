"use server"

import { forgotPasswordSchema, registerSchema, resetPasswordSchema } from "@/schema"
import { z } from "zod"
import { redirect } from 'next/navigation';
import prisma from "./db";
import jwt, { JwtPayload } from "jsonwebtoken"
import moment from "moment"
import { auth } from "./auth";
import bot from "./bot";
import bcrypt from "bcrypt"

export const resetPassword = async (prevState: any, values: any) => {
    const { password, passwordConfirmation, token } = values

    try {
        const { telegramId } = jwt.verify(token, process.env.FORGOT_PASSWORD_SECRET!) as JwtPayload;
        const hashedPassword = await bcrypt.hash(password, 10)

        const updatePassword = await prisma.user.update({
            where: {
                telegramId: telegramId
            },
            data: {
                password: hashedPassword
            }
        })

        await bot.telegram.sendMessage(telegramId, "Password akun anda berhasil diubah!")
        
        return {
            success: true,
            message: "Password Berhasil diubah"
        }
    } catch (err) {
        return {
            success: false,
            message: "Telegram Id salah atau tidak ditemukan"
        }
    }
}

export const forgotPassword = async (prevState: any, values: z.infer<typeof forgotPasswordSchema>) => {
    const { telegramId } = values

    const existedTelegramId = await prisma.user.findUnique({
        where: {
            telegramId: telegramId
        }
    })

    if (!existedTelegramId) return {
        success: false,
        message: "Telegram Id tidak ditemukan"
    }

    const encodedTelegramId = jwt.sign({ telegramId: telegramId }, process.env.FORGOT_PASSWORD_SECRET!, { expiresIn: '1h' })
    const linkResetPassword = `<a href="${process.env.ROUTE_ORIGIN}/reset-password/${encodedTelegramId}">Click disini</a>`

    const messageTelegram = `Berikut ini adalah tautan menuju reset password akun anda: ${linkResetPassword}`


    const sendMessage = await bot.telegram.sendMessage(telegramId, messageTelegram, { parse_mode: 'HTML' })

    console.log(messageTelegram);

    return {
        success: true,
        message: "Link reset password berhasil dikirim!. Cek bot kami sekarang juga!"
    }

}

export const signUp = async (prevState: any, values: z.infer<typeof registerSchema>) => {
    const { name, email, telegramId, password, passwordConfirmation } = values


    const req = await fetch(`${process.env.ROUTE_ORIGIN}/api/auth/sign-up`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            email: email,
            telegramId: telegramId,
            password: password,
            passwordConfirmation: passwordConfirmation
        })
    })

    const res = await req.json()

    if (res.status === 400) {
        return {
            message: "Telegram Id tidak ditemukan, hubungi chatbot kami!"
        }
    } else if (res.status === 422) {
        return {
            message: "Telegram Id sudah terdaftar, silahkan login kembali"
        }
    } else if (res.status === 201) {
        return redirect("/sign-in")
    } else {
        return {
            message: "Server internal kami sedang error"
        }
    }
}


// export const createTransactionDetails = async (formData: FormData) => {
//     const session = await auth()
//     if (!session) {
//         return redirect("/sign-in")
//     }
//     const rawFormData = Object.fromEntries(formData)
//     const { userId, telegramId, membershipId, price, memberDuration } = rawFormData
//     const expireAt = moment().add(Number(memberDuration), "months")

//     const existedPeriod = await prisma.transactionDetail.findFirst({
//         where: {
//             telegramId: telegramId as string,
//             expireAt: {
//                 gte: moment().format()
//             }
//         },
//         orderBy: {
//             expireAt: "desc"
//         }
//     })

//     if (!existedPeriod) {
//         const sendInvitation = await fetch(`${process.env.ROUTE_ORIGIN}/api/sendInvitation`, {
//             method: "POST",
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 telegramId: telegramId
//             })
//         })

//         const response = await sendInvitation.json()

//         console.log(response);
//     } else {
//         const deActive = await prisma.transactionDetail.updateMany({
//             where: {
//                 telegramId: telegramId as string
//             },
//             data: {
//                 isActive: false
//             },
//         })
//     }

//     const remainPeriod = existedPeriod?.expireAt

//     let newExpireAt = moment(expireAt); // Buat salinan expireAt

//     if (remainPeriod) {
//         const diff = moment(remainPeriod).diff(moment(), 'milliseconds'); // Hitung selisih waktu dalam milidetik
//         newExpireAt.add(diff); // Tambahkan selisih waktu ke expireAt
//     }

//     const transaction = await prisma.transaction.create({
//         data: {
//             userId: userId as string,
//             membershipId: membershipId as string,
//             transactionDetail: {
//                 create: {
//                     telegramId: telegramId as string,
//                     price: BigInt(price as string),
//                     expireAt: newExpireAt.format()
//                 }
//             }
//         }
//     })
// }
