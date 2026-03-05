import React from "react";
import CardBox from "../../shared/CardBox";
import DisableInputWithbutton from "./code/DisableInputWithButtonCode";
import DisableInputWithButtonCode from "./code/DisableInputWithButtonCode.tsx?raw";
import CodeDialog from "../../ui-components/CodeDialog";

const DisabledInput = () => {
  return (
    <CardBox className="p-0">
      <div>
      <div className="p-6">
        <h4 className="text-lg font-semibold">Disable Input</h4>
        <DisableInputWithbutton />
      </div>
      <CodeDialog>{DisableInputWithButtonCode}</CodeDialog>
      </div>
    </CardBox>
  );
};

export default DisabledInput;
