'use client'
import { memo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useToast } from '@/contexts/ToastContext'
import { prefectures } from '@/utils/contents'
import { signinFormSchema, signinFormData } from '@/utils/validations/schema'

const SigninForm = memo(() => {
  const { showToast } = useToast()
  const router = useRouter()
  const handleOnSubmit: SubmitHandler<signinFormData> = async (data) => {
    try {
      const res = await fetch('/api/signin', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const toastMessage = res.ok ? '登録に成功しました' : '登録に失敗しました'
      const toastType = res.ok ? 'success' : 'error'

      showToast(`${toastMessage}`, `${toastType}`)

      if (res.ok) {
        // TODO: トップページに遷移した後にToastを表示する
        router.push('/')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors: formatError, isValid, isSubmitting }
  } = useForm<signinFormData>({
    mode: 'onBlur',
    resolver: zodResolver(signinFormSchema)
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
          {...register('userId')}
        />
        {formatError.userId && (
          <span className='mt-1 text-xs text-error'>
            {formatError.userId.message}
          </span>
        )}
      </div>
      <div className='mt-6 flex w-80 flex-col'>
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
          <label htmlFor='prefecture' className=''>
            登録地域
          </label>
          <span className='text-xs text-error'>※必須</span>
        </div>
        <select
          id='prefecture'
          className='select select-accent w-full max-w-xs'
          {...register('prefecture')}
        >
          <option value={''}>選択してください</option>
          {prefectures.map((prefecture) => (
            <option key={prefecture.name} value={prefecture.value}>
              {prefecture.name}
            </option>
          ))}
        </select>
        {formatError.prefecture && (
          <span className='mt-1 text-xs text-error'>
            {formatError.prefecture.message}
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
      <div className='mt-6 flex w-80 flex-col'>
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
          {...register('passwordConfirm')}
        />
        {formatError.passwordConfirm && (
          <span className='mt-1 text-xs text-error'>
            {formatError.passwordConfirm.message}
          </span>
        )}
      </div>
      <div className='mt-6 text-center'>
        <button
          className='btn btn-primary px-10'
          type='submit'
          disabled={!isValid || isSubmitting}
        >
          登録
        </button>
      </div>
    </form>
  )
})

SigninForm.displayName = 'SigninForm'

export default SigninForm
