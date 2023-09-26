const Header = () => {
  return (
    <header className='navbar bg-base-300'>
      <div className='mx-auto my-0 w-10/12'>
        <div className='flex-none lg:hidden'>
          <label htmlFor='my-drawer-3' className='btn btn-square btn-ghost'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              className='inline-block h-6 w-6 stroke-current'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M4 6h16M4 12h16M4 18h16'
              ></path>
            </svg>
          </label>
        </div>
        <div className='mx-2 flex-1 px-2'>Navbar Title</div>
        <div className='hidden flex-none lg:block'>
          <ul className='menu menu-horizontal'>
            {/* Navbar menu content here */}
            <li>
              <a>Navbar Item 1</a>
            </li>
            <li>
              <a>Navbar Item 2</a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}

export default Header
