'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Forecast, CoordinateFormItems, Session } from '@/types'

const CreateForm = ({ forecastData }: { forecastData: Forecast[] }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // NOTE: セッション情報を取得するる頻度が増えたら切り出す
    const getSession = async () => {
      const res = await fetch('/api/session', {
        cache: 'no-cache'
      })
      const { session } = await res.json()
      const { user } = session
      setSession(user)
    }
    getSession()
  }, [])
  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      items: forecastData.map(() => ({ outerwear: '', tops: '', bottoms: '' }))
    }
  })
  const { fields } = useFieldArray({
    control,
    name: 'items'
  })

  const handleOnSubmit = (data: CoordinateFormItems) => {
    // TODO: コーディネートデータを露登録するAPIができたら実装する
    console.log(data.items)
  }

  return (
    <div>
      <div className='bg-white py-6 sm:py-8 lg:py-12'>
        <div className='mx-auto max-w-screen-2xl px-4 md:px-8'>
          <div className='mb-10 md:mb-16'>
            <h2 className='mb-4 text-center text-2xl font-bold text-gray-800 md:mb-6 lg:text-3xl'>
              Blog
            </h2>

            <p className='mx-auto max-w-screen-md text-center text-gray-500 md:text-lg'>
              This is a section of some simple filler text, also known as
              placeholder text. It shares some characteristics of a real written
              text but is random or otherwise generated.
            </p>
          </div>

          <form
            className=''
            onSubmit={(event) => {
              void handleSubmit(handleOnSubmit)(event)
            }}
          >
            <div className='grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8'>
              {fields.map(({ id, outerwear, tops, bottoms }, index) => (
                <div
                  className='flex flex-1 flex-col overflow-hidden rounded-lg border bg-white p-4 sm:p-6'
                  key={id}
                >
                  <div>
                    <div className=''>
                      <p>{forecastData[index].date}</p>
                    </div>
                    <div className=''>
                      <p>
                        最高気温&#65306;{forecastData[index].maxTemperature}
                      </p>
                    </div>
                    <div className=''>
                      <p>
                        最低気温&#65306;{forecastData[index].minTemperature}
                      </p>
                    </div>
                  </div>
                  <div className='mt-3'>
                    <div className='flex flex-col'>
                      <label htmlFor={`outerwear${index}`} className=''>
                        アウター
                      </label>
                      <input
                        id={`outerwear${index}`}
                        type='text'
                        autoComplete='text'
                        placeholder='例&#65306;レザージャケット'
                        className='input input-bordered input-accent'
                        {...register(`items.${index}.outerwear`)}
                        defaultValue={outerwear}
                      />
                    </div>
                    <div className='mt-3 flex flex-col'>
                      <label htmlFor={`tops${index}`} className=''>
                        トップス
                      </label>
                      <textarea
                        id={`tops${index}`}
                        autoComplete='text'
                        placeholder='例&#65306;Tシャツ'
                        className='input input-bordered input-accent'
                        {...register(`items.${index}.tops`)}
                        defaultValue={tops}
                      />
                    </div>
                    <div className='mt-3 flex flex-col'>
                      <label htmlFor={`bottoms${index}`} className=''>
                        ボトムス
                      </label>
                      <input
                        id={`bottoms${index}`}
                        type='text'
                        autoComplete='text'
                        placeholder='例&#65306;デニムパンツ'
                        className='input input-bordered input-accent'
                        {...register(`items.${index}.bottoms`)}
                        defaultValue={bottoms}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className='mt-6 text-center'>
              <button className='btn btn-primary px-10' type='submit'>
                送信
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateForm
