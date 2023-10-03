import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { name, email, password } = (await req.json()) as {
      name: string
      email: string
      password: string
    }
    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword
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
