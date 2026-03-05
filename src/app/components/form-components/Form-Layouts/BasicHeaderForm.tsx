"use client";
import {
  Alert,
  Label,
  TextInput,
  Select,
  Datepicker,
  Radio,
  Button,
} from "flowbite-react";
import React from "react";
import TitleCard from "../../shared/TitleBorderCard";
import { HiInformationCircle } from "react-icons/hi";

const BasicHeaderForm = () => {
  return (
    <div>
      <TitleCard title="Basic Header Form">
        <div className="pb-6">
          <Alert color="lightprimary" icon={HiInformationCircle}>
            <span className="font-medium">Person Info</span>
          </Alert>
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className="sm:col-span-6 col-span-12">
            <div className="mb-2 block">
              <Label htmlFor="firstname">First Name</Label>
            </div>
            <TextInput className="form-control" id="firstname" type="text" sizing="md" />
          </div>
          <div className="sm:col-span-6 col-span-12">
            <div className="mb-2 block">
              <Label htmlFor="lastname">Last Name</Label>
            </div>
            <TextInput className="form-control" id="lastname" type="text" sizing="md" />
          </div>
          <div className="sm:col-span-6 col-span-12">
            <div className="mb-2 block">
              <Label htmlFor="gender">Select Gender</Label>
            </div>
            <Select id="gender" required className="select-md">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </Select>
          </div>
          <div className="sm:col-span-6 col-span-12">
            <div className="mb-2 block">
              <Label htmlFor="birth">Date of Birth</Label>
            </div>
            <Datepicker id="birth" className="form-control" />
          </div>
          <div className="col-span-12">
            <Label htmlFor="membership" className="mb-3 inline-block">
              Membership
            </Label>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 pb-2">
                <Radio id="free" name="membership" value="free" defaultChecked />
                <Label htmlFor="free">Free</Label>
              </div>
              <div className="flex items-center gap-2 pb-2">
                <Radio id="paid" name="membership" value="paid" />
                <Label htmlFor="paid">Paid</Label>
              </div>
            </div>
          </div>
          <div className="col-span-12">
            <Alert color="lightprimary" icon={HiInformationCircle}>
              <span className="font-medium">Address</span>
            </Alert>
          </div>
          <div className="col-span-12">
            <div className="mb-2 block">
              <Label htmlFor="street">Street</Label>
            </div>
            <TextInput className="form-control" id="street" type="text" sizing="md" />
          </div>
          <div className="sm:col-span-6 col-span-12">
            <div className="mb-2 block">
              <Label htmlFor="city">City</Label>
            </div>
            <TextInput className="form-control" id="city" type="text" sizing="md" />
          </div>
          <div className="sm:col-span-6 col-span-12">
            <div className="mb-2 block">
              <Label htmlFor="state">State</Label>
            </div>
            <TextInput className="form-control" id="state" type="text" sizing="md" />
          </div>
          <div className="sm:col-span-6 col-span-12">
            <div className="mb-2 block">
              <Label htmlFor="postcode">Post Code</Label>
            </div>
            <TextInput className="form-control" id="postcode" type="text" sizing="md" />
          </div>
          <div className="sm:col-span-6 col-span-12">
            <div className="mb-2 block">
              <Label htmlFor="country">Country</Label>
            </div>
            <Select id="country" required className="select-md">
              <option>United States</option>
              <option>Canada</option>
              <option>France</option>
              <option>Germany</option>
            </Select>
          </div>
          <div className="col-span-12 flex items-center gap-[1rem]">
            <Button type="reset" color="error">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              Submit
            </Button>
          </div>
        </div>
      </TitleCard>
    </div>
  );
};

export default BasicHeaderForm;
