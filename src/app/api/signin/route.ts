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
      throw new Error('都道府県が見つかりませんでした')
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
    // TODO: サインイン機能実装時にエラー処理を実装する
    if (error instanceof Error) {
      return new NextResponse(
        JSON.stringify({
          status: 'error',
          message: error.message
        }),
        { status: 500 }
      )
    } else if (typeof error === 'string') {
      console.log(error)
    } else {
      console.log('unexpected error')
    }
  }
}
