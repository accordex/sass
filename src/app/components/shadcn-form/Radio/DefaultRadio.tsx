import * as React from "react";
import CardBox from "../../shared/CardBox";
import Defaultradio from "./code/DefaultRadioCode";
import DefaultRadioCode from "./code/DefaultRadioCode.tsx?raw";
import CodeDialog from "../../ui-components/CodeDialog";
const DefaultRadio = () => {
  return (
    <CardBox className="p-0">
      <div>
      <div className="p-6">
        <h4 className="text-lg font-semibold">Default Radio Group</h4>
        <Defaultradio/>
      </div>
      <CodeDialog>{DefaultRadioCode}</CodeDialog>
      </div>
    </CardBox>
  );
};

export default DefaultRadio;
