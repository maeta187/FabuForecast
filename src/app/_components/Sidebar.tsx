import Link from 'next/link'

const Sidebar = () => {
  return (
    <div className='drawer-side'>
      <label htmlFor='my-drawer-3' className='drawer-overlay'></label>
      <ul className='menu min-h-full w-80 bg-base-200 p-4'>
        {/* TODO: ログイン機能実装後セッションデータをもとにナビバーを切り替えるようにする */}
        <li>
          <Link href='/signin'>サインイン</Link>
        </li>
        <li>
          <Link href='/login'>ログイン</Link>
        </li>
      </ul>
    </div>
  )
}

export default Sidebar
