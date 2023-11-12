'use client'

import { Forecast } from '@/types'

const CreateForm = ({ forecastData }: { forecastData: Forecast[] }) => {
  return (
    <div>
      <form action=''>
        <div className='bg-white py-6 sm:py-8 lg:py-12'>
          <div className='mx-auto max-w-screen-2xl px-4 md:px-8'>
            <div className='mb-10 md:mb-16'>
              <h2 className='mb-4 text-center text-2xl font-bold text-gray-800 md:mb-6 lg:text-3xl'>
                Blog
              </h2>

              <p className='mx-auto max-w-screen-md text-center text-gray-500 md:text-lg'>
                This is a section of some simple filler text, also known as
                placeholder text. It shares some characteristics of a real
                written text but is random or otherwise generated.
              </p>
            </div>

            <div className='grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8'>
              {/* <div className='flex flex-col overflow-hidden rounded-lg border bg-white'> */}
              {/* <div className='flex flex-1 flex-col p-4 sm:p-6'> */}
              {/* カードコンテンツ:開始 */}
              {forecastData.map(
                ({ date, maxTemperature, minTemperature }, index) => (
                  <div
                    className='flex flex-1 flex-col overflow-hidden rounded-lg border bg-white p-4 sm:p-6'
                    key={index}
                  >
                    <div>
                      <div className=''>
                        <p>{date}</p>
                      </div>
                      <div className=''>
                        <p>最高気温&#65306;{maxTemperature}</p>
                      </div>
                      <div className=''>
                        <p>最低気温&#65306;{minTemperature}</p>
                      </div>
                    </div>
                    <div className='mt-3'>
                      <div className='flex flex-col'>
                        <label htmlFor='outerwear' className=''>
                          アウター
                        </label>
                        <input
                          id='outerwear'
                          type='text'
                          autoComplete='text'
                          placeholder='例&#65306;レザージャケット'
                          className='input input-bordered input-accent'
                        />
                      </div>
                      {/* TODO: 機能実装の際、トップスは複数登録できるようにする */}
                      <div className='mt-3 flex flex-col'>
                        <label htmlFor='' className=''>
                          トップス
                        </label>
                        <input
                          id=''
                          type='text'
                          autoComplete='text'
                          placeholder='例&#65306;Tシャツ'
                          className='input input-bordered input-accent'
                        />
                      </div>
                      <div className='mt-3 flex flex-col'>
                        <label htmlFor='bottoms' className=''>
                          ボトムス
                        </label>
                        <input
                          id='bottoms'
                          type='text'
                          autoComplete='text'
                          placeholder='例&#65306;デニムパンツ'
                          className='input input-bordered input-accent'
                        />
                      </div>
                    </div>
                  </div>
                )
              )}
              {/* カードコンテンツ:終了 */}
              {/* </div> */}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreateForm
