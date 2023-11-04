import LoginForm from '@/app/login/_components/LoginForm'
import { ToastProvider } from '@/contexts/ToastContext'

export default function Page() {
  return (
    <div>
      <div className='relative mx-auto my-0 h-screen w-10/12'>
        <ToastProvider>
          <LoginForm />
        </ToastProvider>
      </div>
    </div>
  )
}
