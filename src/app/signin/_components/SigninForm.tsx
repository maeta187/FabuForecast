'use client'

const SigninForm = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  return (
    <form
      className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-12 shadow-2xl'
      onSubmit={handleSubmit}
    >
      <h1>SigninForm</h1>
      <div className='flex flex-col'>
        <div>
          <label htmlFor='user-id' className=''>
            ユーザーID
          </label>
          <span className='text-xs text-error'>※必須</span>
        </div>
        <input
          id='user-id'
          type='text'
          autoComplete='off'
          placeholder='ユーザーID'
          className='input input-bordered input-accent w-full max-w-xs'
        />
      </div>
      <div className='mt-6 flex flex-col'>
        <div>
          <label htmlFor='email' className=''>
            メールアドレス
          </label>
          <span className='text-xs text-error'>※必須</span>
        </div>
        <input
          id='email'
          type='email'
          autoComplete='email'
          placeholder='example@example.com'
          className='input input-bordered input-accent w-full max-w-xs'
        />
      </div>
      <div className='mt-6 flex flex-col'>
        <div>
          <label htmlFor='password' className=''>
            パスワード
          </label>
          <span className='text-xs text-error'>※必須</span>
        </div>
        <input
          id='password'
          type='password'
          autoComplete='new-password'
          placeholder='パスワードを入力してください'
          className='input input-bordered input-accent w-full max-w-xs'
        />
      </div>
      <div className='mt-6 flex flex-col'>
        <div>
          <label htmlFor='password-confirm' className=''>
            パスワード（確認用）
          </label>
          <span className='text-xs text-error'>※必須</span>
        </div>
        <input
          id='password-confirm'
          type='password'
          autoComplete='new-password'
          placeholder='パスワードを再入力してください'
          className='input input-bordered input-accent w-full max-w-xs'
        />
      </div>
      <div className='mt-6 text-center'>
        <button className='btn btn-primary px-10' type='submit'>
          登録
        </button>
      </div>
    </form>
  )
}

export default SigninForm
