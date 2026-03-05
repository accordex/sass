import React from 'react'
import { Input } from "@/app/components/shadcn-ui/Default-Ui/input";
import { Label } from "@/app/components/shadcn-ui/Default-Ui/label";


const InputLabelCode = () => {
  return (
    <>
      <div className=" max-w-sm flex flex-col gap-5 mt-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input type="text" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input type="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input type="password" />
        </div>
      </div>
    </>
  )
}

export default InputLabelCode