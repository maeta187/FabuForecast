import { NextResponse } from 'next/server'
import { Forecast } from '@/types'

export async function GET() {
  // TODO: ログイン機能実装後セッションデータから緯度経度を取得する
  const url =
    'https://api.open-meteo.com/v1/forecast?latitude=34.4&longitude=132.45&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo'

  const response = await fetch(url)
  if (!response.ok) {
    return NextResponse.error()
  }
  const data: Forecast = await response.json()

  return NextResponse.json(data)
}

// NOTE: コンポーネントでは以下のように呼び出す
// const baseUrl = process.env.NEXTAUTH_URL
// const response = await fetch(`${baseUrl}/api/forecast`, {
//   cache: 'no-cache'
// })
// const forecast = await response.json()
