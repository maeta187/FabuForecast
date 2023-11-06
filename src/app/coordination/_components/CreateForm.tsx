const CreateForm = () => {
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
              <div className='flex flex-1 flex-col overflow-hidden rounded-lg border bg-white p-4 sm:p-6'>
                <h2 className='mb-2 text-lg font-semibold text-gray-800'>
                  <a
                    href='#'
                    className='transition duration-100 hover:text-indigo-500 active:text-indigo-600'
                  >
                    New trends in Tech
                  </a>
                </h2>

                <p className='mb-8 text-gray-500'>
                  This is a section of some simple filler text, also known as
                  placeholder text. It shares some characteristics of a real
                  written text.
                </p>

                <div className='mt-auto flex items-end justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100'>
                      {/* <img
                          src='https://images.unsplash.com/photo-1611898872015-0571a9e38375?auto=format&q=75&fit=crop&w=64'
                          loading='lazy'
                          alt='Photo by Brock Wegner'
                          className='h-full w-full object-cover object-center'
                        /> */}
                    </div>

                    <div>
                      <span className='block text-indigo-500'>Mike Lane</span>
                      <span className='block text-sm text-gray-400'>
                        July 19, 2021
                      </span>
                    </div>
                  </div>

                  <span className='rounded border px-2 py-1 text-sm text-gray-500'>
                    Article
                  </span>
                </div>
              </div>
              {/* </div> */}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreateForm
