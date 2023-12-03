// 都道府県
export type Prefecture = {
  name: string
  value: string
  latitude: number
  longitude: number
}

// 天気取得APIの日付
type ResponseDaily = {
  time: string[]
  temperature_2m_max: string[]
  temperature_2m_min: string[]
}

// 天教APIのレスポンス
export interface ResponseForecast {
  daily: ResponseDaily
}

// 天気予報
export type Forecast = {
  date: string
  maxTemperature: string
  minTemperature: string
}

export type CoordinationList = {
  outerwear: string
  tops: string
  bottoms: string
}

export type CoordinateFormItems = {
  items: CoordinationList[]
}

type Session = {
  id: string
  name: string
  email: string
}
