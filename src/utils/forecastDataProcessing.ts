import { ResponseForecast, Forecast } from '@/types'

export const forecastDataProcessing = (data: ResponseForecast): Forecast[] => {
  const date = timeProcessing(data.daily.time)
  const maxTemperature = temperatureProcessing(data.daily.temperature_2m_max)
  const minTemperature = temperatureProcessing(data.daily.temperature_2m_min)
  const result = date.map((date, i) => ({
    date,
    maxTemperature: maxTemperature[i],
    minTemperature: minTemperature[i]
  }))
  return result
}

const timeProcessing = (time: string[]) => {
  const timeMap = time.map((item) => {
    const date = new Date(item)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}年${month}月${day}日`
  })
  return timeMap
}

const temperatureProcessing = (temperature: string[]) => {
  const temperatureMap = temperature.map((item) => {
    return `${item}℃`
  })
  return temperatureMap
}
