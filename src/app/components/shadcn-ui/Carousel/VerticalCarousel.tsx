import * as React from "react"
import CardBox from "../../shared/CardBox"
import Verticalcarousel from './code/VerticalCarouselCode'
import VerticalCarouselCode from './code/VerticalCarouselCode.tsx?raw'
import CodeDialog from "../../ui-components/CodeDialog"

export function VerticalCarousel() {
  return (
    <CardBox className="p-0">
      <div>
    <div className="p-6">
        <h4 className="text-lg font-semibold">Vertical Carousel</h4>
        <Verticalcarousel/>
    </div>
    <CodeDialog>{VerticalCarouselCode}</CodeDialog>
    </div>
</CardBox>

  )
}
