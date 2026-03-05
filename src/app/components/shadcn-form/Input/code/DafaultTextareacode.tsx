import React from 'react'
import { Textarea } from "@/app/components/shadcn-ui/Default-Ui/textarea";


const DafaultTextareacode = () => {
  return (
    <>
      <div className='max-w-sm pt-4'>
        <Textarea placeholder="Type your message here." className="h-[130px]" />
      </div>
    </>
  )
}

export default DafaultTextareacode