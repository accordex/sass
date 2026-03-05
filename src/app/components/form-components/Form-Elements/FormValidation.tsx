import { HelperText, Label, TextInput } from "flowbite-react";
import React from "react";
import CardBox from "../../shared/CardBox";

const FormValidation = () => {
  return (
    <div>
      <CardBox>
        <h4 className="text-lg font-semibold mb-4">Form validation</h4>
        <div className="flex max-w-md flex-col gap-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="username3" color="success">Your name</Label>
            </div>
            <TextInput className="form-control"
              id="username"
              placeholder="Bonnie Green"
              required
              color="success"
            />
            <HelperText>
              <>
                  <span className="font-medium">Alright!</span> Username
                  available!
                </>
            </HelperText>
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="username4" color="failure">Your name</Label>
            </div>
            <TextInput className="form-control"
              id="username4"
              placeholder="Bonnie Green"
              required
              color="failure"
            />
            <HelperText><>
                  <span className="font-medium">Oops!</span> Username already
                  taken!
                </></HelperText>
          </div>
        </div>
      </CardBox>
    </div>
  );
};

export default FormValidation;
