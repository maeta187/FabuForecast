import SigninForm from '@/app/signin/_components/SigninForm'
import { ToastProvider } from '@/contexts/ToastContext'

export default function Page() {
  return (
    <div>
      <div className='relative mx-auto my-0 h-screen w-10/12'>
        <ToastProvider>
          <SigninForm />
        </ToastProvider>
      </div>
    </div>
  )
}
