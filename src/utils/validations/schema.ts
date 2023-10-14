import { z } from 'zod'

const userIdValidation = z
  .string()
  .min(1, '入力が必須の項目です')
  .min(8, '8文字以上で入力してください')
  .regex(/^[a-zA-Z0-9]+$/, 'ユーザーIDは英数字のみで入力してください')

const emailValidation = z
  .string()
  .min(1, '入力が必須の項目です')
  .email('正しいメールアドレスの形式で入力してください')

const prefectureValidation = z.string().min(1, '入力が必須の項目です')

const passwordValidation = z
  .string()
  .min(1, '入力が必須の項目です')
  .min(8, '8文字以上で入力してください')
  .max(20, 'パスワードは20文字以下である必要があります')
  .regex(
    /^(?=.*[a-z])(?=.*\d)[a-z\d]{8,20}$/,
    'パスワードは小文字、数字を含む必要があります'
  )

export const signinFormSchema = z
  .object({
    userId: userIdValidation,
    email: emailValidation,
    prefecture: prefectureValidation,
    password: passwordValidation,
    passwordConfirm: passwordValidation
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'パスワードと一致しません',
    path: ['passwordConfirm']
  })

export const loginFormSchema = z.object({
  email: emailValidation,
  password: passwordValidation
})

export type signinFormData = z.infer<typeof signinFormSchema>

export type loginFormData = z.infer<typeof loginFormSchema>
