'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { loginFormSchema, loginFormData } from '@/utils/validations/schema'

const LoginForm = () => {
  const handleOnSubmit: SubmitHandler<loginFormData> = (data) => {
    console.log(data)
  }

  const {
    register,
    handleSubmit,
    formState: { errors: formatError, isValid, isSubmitting }
  } = useForm<loginFormData>({
    mode: 'onBlur',
    resolver: zodResolver(loginFormSchema)
  })

  return (
    <form
      className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-12 shadow-2xl'
      onSubmit={(event) => {
        void handleSubmit(handleOnSubmit)(event)
      }}
    >
      <div className='flex w-80 flex-col'>
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
          {...register('email')}
        />
        {formatError.email && (
          <span className='mt-1 text-xs text-error'>
            {formatError.email.message}
          </span>
        )}
      </div>
      <div className='mt-6 flex w-80 flex-col'>
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
          {...register('password')}
        />
        {formatError.password && (
          <span className='mt-1 text-xs text-error'>
            {formatError.password.message}
          </span>
        )}
      </div>
      <div className='mt-6 text-center'>
        <button
          className='btn btn-primary px-10'
          type='submit'
          disabled={!isValid || isSubmitting}
        >
          ログイン
        </button>
      </div>
    </form>
  )
}

export default LoginForm
