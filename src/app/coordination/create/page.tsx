import CreateForm from '@/app/coordination/_components/CreateForm'
import { ResponseForecast } from '@/types'
import { forecastDataProcessing } from '@/utils'

export default async function Page() {
  const baseUrl = process.env.NEXTAUTH_URL
  const response = await fetch(`${baseUrl}/api/forecast`, {
    cache: 'no-cache'
  })
  const forecast: ResponseForecast = await response.json()
  if (!forecast) return
  const forecastData = forecastDataProcessing(forecast)
  return (
    <div>
      <div className='relative mx-auto my-0 h-screen w-10/12'>
        <CreateForm forecastData={forecastData} />
      </div>
    </div>
  )
}
