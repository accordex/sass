import React from 'react'
import { Label } from "@/app/components/shadcn-ui/Default-Ui/label";
import { Button } from '@/app/components/shadcn-ui/Default-Ui/button';
import { Input } from "@/app/components/shadcn-ui/Default-Ui/input";
const InputWithButtonCode = () => {
  return (
    <>
      <div className="max-w-sm flex flex-col gap-5 mt-4">
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
        <div className="flex gap-3">
          <Button>Submit</Button>
          <Button variant={"error"}>Cancel</Button>
        </div>
      </div>
    </>
  )
}

export default InputWithButtonCode