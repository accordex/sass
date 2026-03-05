import { Button, Tooltip } from 'flowbite-react'

const DisableTooltipCode = () => {
  return (
    <div>
      <div>
        <Tooltip content='Tooltip content' arrow={false}>
          <Button color='info'>Default Tooltip</Button>
        </Tooltip>
      </div>
    </div>
  )
}

export default DisableTooltipCode
