import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/app/_components/Header'
import SideBar from '@/app/_components/Sidebar'
// NOTE: ページ全体でセッション情報を使う場合はコメントアウトを外す
// import { NextAuthProvider } from '@/contexts/SessionContext'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FabuForecast',
  description: '天気を元にコーディネートを考えるアプリ'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='ja'>
      <body className={inter.className}>
        {/* <NextAuthProvider> */}
        <div className='drawer'>
          <input id='my-drawer-3' type='checkbox' className='drawer-toggle' />
          <div className='drawer-content flex flex-col'>
            <Header />
            {children}
          </div>
          <SideBar />
        </div>
        {/* </NextAuthProvider> */}
      </body>
    </html>
  )
}
