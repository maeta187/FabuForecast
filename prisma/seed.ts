import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await hash('password123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      name: 'Admin',
      coordinationLists: {
        create: [
          {
            outerwear: 'Jacket',
            tops: 'T-shirt',
            bottoms: 'Jeans'
          },
          {
            outerwear: 'Coat',
            tops: 'Sweater',
            bottoms: 'Chinos'
          }
        ]
      },
      prefecture: {
        create: {
          name: '東京都',
          value: 'tokyo',
          latitude: 35.6895,
          longitude: 139.6917
        }
      },
      password
    }
  })
  console.log({ user })
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (e: Error) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
