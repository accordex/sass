import { Progress } from 'flowbite-react'

const LabelPositionCode = () => {
  return (
    <div>
      <div className='flex flex-col gap-2'>
        <Progress
          progress={20}
          progressLabelPosition='inside'
          textLabel='MaterialM'
          textLabelPosition='outside'
          size='lg'
          labelProgress
          labelText
        />
        <Progress
          progress={40}
          progressLabelPosition='inside'
          textLabel='MaterialPro'
          textLabelPosition='outside'
          size='lg'
          labelProgress
          labelText
        />
        <Progress
          progress={60}
          progressLabelPosition='inside'
          textLabel='AdminProPro'
          textLabelPosition='outside'
          size='lg'
          labelProgress
          labelText
        />
        <Progress
          progress={80}
          progressLabelPosition='inside'
          textLabel='Flexy'
          textLabelPosition='outside'
          size='lg'
          labelProgress
          labelText
        />
        <Progress
          progress={100}
          progressLabelPosition='inside'
          textLabel='Spike'
          textLabelPosition='outside'
          size='lg'
          labelProgress
          labelText
        />
      </div>
    </div>
  )
}

export default LabelPositionCode
