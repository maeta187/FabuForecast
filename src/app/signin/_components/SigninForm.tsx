const SigninForm = () => {
  return (
    <form>
      <h1>SigninForm</h1>
      <div>
        <div className='block'>
          <label htmlFor='user-id' className=''>
            ユーザーID
          </label>
          <span className='text-xs text-error'>※必須</span>
        </div>
        <input
          id='user-id'
          type='text'
          placeholder='ユーザーID'
          className='input input-bordered input-accent w-full max-w-xs'
        />
      </div>
    </form>
  )
}

export default SigninForm
