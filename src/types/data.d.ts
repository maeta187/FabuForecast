// 都道府県
export type Prefecture = {
  name: string
  value: string
  latitude: number
  longitude: number
}

// 天気取得APIの日付
type Daily = {
  time: string[]
}

// 天教
export interface Forecast {
  daily: Daily
  temperature_2m_max: string[]
  temperature_2m_min: string[]
}
