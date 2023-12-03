// import { NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  console.log(id)

  // return NextResponse.json(id)
}
