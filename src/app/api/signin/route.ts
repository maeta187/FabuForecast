import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { findPrefecture } from '@/utils'

export async function POST(req: Request) {
  try {
    const { userId, email, password, prefecture } = (await req.json()) as {
      userId: string
      email: string
      password: string
      prefecture: string
    }
    const prefectureData = findPrefecture(prefecture)
    if (!prefectureData) {
      throw new Error('都道府県が見つかりませんでした', { cause: 400 })
    }
    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: userId,
        email: email.toLowerCase(),
        password: hashedPassword,
        prefecture: {
          connectOrCreate: {
            create: prefectureData,
            where: prefectureData
          }
        }
      },
      include: {
        prefecture: true
      }
    })

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    if (error instanceof Error) {
      const status = error.cause ?? 500
      return new NextResponse(
        JSON.stringify({
          status: 'error',
          message: error.message
        }),
        { status: status as number }
      )
    } else {
      return new NextResponse('Unexpected error', { status: 500 })
    }
  }
}
