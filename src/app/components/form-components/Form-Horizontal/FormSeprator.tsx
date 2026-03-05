import { Label, TextInput, Select, Datepicker, Button } from "flowbite-react";
import React from "react";
import TitleCard from "../../shared/TitleBorderCard";

const FormSeprator = () => {
  return (
    <div>
      <TitleCard title="Form Separator">
        <div className="grid grid-cols-12 items-center pb-[1.875rem]">
          <div className="col-span-3">
            <h6 className="text-lg">Account Details</h6>
          </div>
          <div className="col-span-9"></div>
        </div>

        <div className="grid grid-cols-12 items-center pb-[1.875rem]">
          <div className="col-span-3">
            <Label htmlFor="username">Username</Label>
          </div>
          <div className="col-span-9">
            <TextInput
              className="form-control"
              id="username"
              type="text"
              placeholder="John Deo"
              sizing="md"
            />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center pb-[1.875rem]">
          <div className="col-span-3">
            <Label htmlFor="email">Email</Label>
          </div>
          <div className="col-span-9">
            <TextInput
              className="form-control"
              id="email"
              type="text"
              placeholder="john.deo@example.com"
              sizing="md"
            />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center pb-[1.875rem]">
          <div className="col-span-3">
            <Label htmlFor="password">Password</Label>
          </div>
          <div className="col-span-9">
            <TextInput
              className="form-control"
              id="password"
              type="password"
              placeholder="john.deo"
              sizing="md"
            />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center pb-[1.875rem] border-t border-border pt-5 dark:border-darkborder">
          <div className="col-span-3">
            <h6 className="text-lg">Personal Info</h6>
          </div>
          <div className="col-span-9"></div>
        </div>

        <div className="grid grid-cols-12 items-center pb-[1.875rem]">
          <div className="col-span-3">
            <Label htmlFor="fullname">Full Name</Label>
          </div>
          <div className="col-span-9">
            <TextInput
              className="form-control"
              id="fullname"
              type="text"
              placeholder="John Deo"
              sizing="md"
            />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center pb-[1.875rem]">
          <div className="col-span-3">
            <Label htmlFor="country">Country</Label>
          </div>
          <div className="col-span-9">
            <Select id="country" required className="select-md">
              <option>India</option>
              <option>Europe</option>
              <option>France</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center pb-[1.875rem]">
          <div className="col-span-3">
            <Label htmlFor="birthdate">Birth Date</Label>
          </div>
          <div className="col-span-9">
            <Datepicker className="form-control" />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center pb-[1.875rem]">
          <div className="col-span-3">
            <Label htmlFor="phone">Phone No</Label>
          </div>
          <div className="col-span-9">
            <TextInput
              className="form-control"
              id="phone"
              type="text"
              placeholder="512 2250 551"
              sizing="md"
            />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center">
          <div className="col-span-3"></div>
          <div className="col-span-9 flex items-center gap-[1rem]">
            <Button type="submit" color="primary">
              Submit
            </Button>
            <Button type="reset" color="error">
              Cancel
            </Button>
          </div>
        </div>
      </TitleCard>
    </div>
  );
};

export default FormSeprator;
