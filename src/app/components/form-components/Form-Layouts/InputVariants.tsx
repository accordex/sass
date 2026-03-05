import { Label, TextInput } from "flowbite-react";
import React from "react";
import TitleCard from "../../shared/TitleBorderCard";

const InputVariants = () => {
  return (
    <div>
      <TitleCard title="Input Variants">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <Label htmlFor="input-gray" color="gray">Gray</Label>
            <TextInput
              id="input-gray"
              placeholder="Input Gray"
              required
              color="gray"
            />
          </div>
          <div className="col-span-12">
            <Label htmlFor="input-info" color="info">Info</Label>
            <TextInput
              id="input-info"
              placeholder="Input Info"
              required
              color="info"
            />
          </div>
          <div className="col-span-12">
            <Label htmlFor="input-success" color="success">Success</Label>
            <TextInput
              id="input-success"
              placeholder="Input Success"
              required
              color="success"
            />
          </div>
          <div className="col-span-12">
            <Label htmlFor="input-failure" color="failure">Failure</Label>
            <TextInput
              id="input-failure"
              placeholder="Input Failure"
              required
              color="failure"
            />
          </div>
          <div className="col-span-12">
            <Label htmlFor="input-warning" color="warning">Warning</Label>
            <TextInput
              id="input-warning"
              placeholder="Input Warning"
              required
              color="warning"
            />
          </div>
        </div>
      </TitleCard>
    </div>
  );
};

export default InputVariants;
