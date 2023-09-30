import Image from 'next/image'

export default function Home() {
  return (
    <main className='mx-auto my-0 h-screen w-10/12'>
      <section className='flex flex-col justify-center gap-6 pt-36 sm:gap-10 md:gap-16 lg:flex-row'>
        <div className='flex flex-col justify-between xl:w-3/12'>
          <div className='sm:text-center lg:py-12 lg:text-left xl:py-24'>
            {/* TODO: 適切なテキストまたは削除する */}
            <p className='mb-4 font-semibold text-indigo-500  md:mb-6 md:text-lg xl:text-xl'>
              Very proud to introduce
            </p>

            <h1 className='text-4xl font-bold sm:text-5xl md:text-6xl'>
              <span className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent'>
                FabuForecast
              </span>
            </h1>
            {/* TODO: ボタンなどのコンテンツ配置または削除する */}
            {/* <div className='flex flex-col gap-2.5 sm:flex-row sm:justify-center lg:justify-start'>
              <a
                href='#'
                className='inline-block rounded-lg bg-indigo-500 px-8 py-3 text-center text-sm font-semibold text-white outline-none ring-indigo-300 transition duration-100 hover:bg-indigo-600 focus-visible:ring active:bg-indigo-700 md:text-base'
              >
                Start now
              </a>

              <a
                href='#'
                className='inline-block rounded-lg bg-gray-200 px-8 py-3 text-center text-sm font-semibold text-gray-500 outline-none ring-indigo-300 transition duration-100 hover:bg-gray-300 focus-visible:ring active:text-gray-700 md:text-base'
              >
                Take tour
              </a>
            </div> */}
          </div>
        </div>
        <div className='relative block h-48 overflow-hidden rounded-lg bg-gray-100 shadow-lg lg:h-auto  xl:w-3/12'>
          {/* TODO: 画像もしくはアイコンにする */}
          <Image
            src='/clouds.jpg'
            alt='Clouds'
            sizes='100vw'
            fill
            style={{
              width: '100%'
            }}
            className='rounded-lg shadow-2xl'
          />
        </div>
      </section>
    </main>
  )
}
