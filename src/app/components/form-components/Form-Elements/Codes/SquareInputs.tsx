import { Label, TextInput, Checkbox, Button } from 'flowbite-react'

const SquareInputsCodes = () => {
  return (
    <>
      <div>
        <form className='flex  flex-col gap-4'>
          <div>
            <div className='mb-2 block'>
              <Label htmlFor='email1'>Your email</Label>
            </div>
            <TextInput
              className='form-control'
              id='email1'
              type='email'
              placeholder='name@materialm.com'
              required
            />
          </div>
          <div>
            <div className='mb-2 block'>
              <Label htmlFor='password1'>Your password</Label>
            </div>
            <TextInput
              className='form-control'
              id='password1'
              type='password'
              required
            />
          </div>
          <div className='flex items-center gap-2'>
            <Checkbox className='checkbox' id='remember1' />
            <Label htmlFor='remember1'>Remember me</Label>
          </div>
          <Button type='submit' color='primary' className='w-fit px-10'>
            Submit
          </Button>
        </form>
      </div>
    </>
  )
}

export default SquareInputsCodes
