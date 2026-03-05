import { Label } from "flowbite-react";
import React from "react";
import CardBox from "../../shared/CardBox";
import { RangeSlider } from "flowbite-react";
const RangeSliders = () => {
  return (
    <div>
      <CardBox>
        <h4 className="text-lg font-semibold mb-4">Range slider</h4>
        <div className="flex max-w-md flex-col gap-4 pb-12">
          <div>
            <div className="mb-1 block">
              <Label htmlFor="default-range">Default</Label>
            </div>
            <RangeSlider id="default-range" />
          </div>
          <div>
            <div className="mb-1 block">
              <Label htmlFor="disbaled-range">Disabled</Label>
            </div>
            <RangeSlider id="disabled-range" disabled />
          </div>
          <div>
            <div className="mb-1 block">
              <Label htmlFor="sm-range">Small</Label>
            </div>
            <RangeSlider id="default-range" sizing="sm" />
          </div>
          <div>
            <div className="mb-1 block">
              <Label htmlFor="md-range">Medium</Label>
            </div>
            <RangeSlider id="default-range" sizing="md" />
          </div>
          <div>
            <div className="mb-1 block">
              <Label htmlFor="lg-range">Large</Label>
            </div>
            <RangeSlider id="default-range" sizing="lg" />
          </div>
        </div>
      </CardBox>
    </div>
  );
};

export default RangeSliders;
