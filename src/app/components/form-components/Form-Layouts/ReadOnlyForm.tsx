"use client"
import { Label, TextInput, Button, HelperText } from "flowbite-react";
import React from "react";
import TitleCard from "../../shared/TitleBorderCard";

const ReadOnlyForm = () => {
  return (
    <div>
      <TitleCard title="Readonly Form">
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-12">
            <div className="mb-2 block">
              <Label htmlFor="name">Name</Label>
            </div>
            <TextInput className="form-control"
              id="name"
              type="text"
              value={"Wrappixel"}
              sizing="md"
              onChange={() => {}}
            />
          </div>
          <div className="col-span-12">
            <div className="mb-2 block">
              <Label htmlFor="emailid">Email</Label>
            </div>
            <TextInput className="form-control"
              id="emailid"
              type="email"
              value={"info@wrappixel.com"}
              onChange={() => {}}
              required
            />
            <HelperText>
              <>
                  We’ll never share your details. Read our
                  <a
                    href="#"
                    className="ml-1 font-medium text-primary hover:underline dark:text-primary"
                  >
                    Privacy Policy
                  </a>
                  .
                </>
            </HelperText>
          </div>
          <div className="col-span-12">
            <div className="mb-2 block">
              <Label htmlFor="password1">Password</Label>
            </div>
            <TextInput className="form-control"
              id="password1"
              type="password"
              value={"info@wrappixel.com"}
              onChange={() => {}}
              required
            />
          </div>
          <div className="col-span-12">
            <Button type="submit" color="primary">
              Submit
            </Button>
          </div>
        </div>
      </TitleCard>
    </div>
  );
};

export default ReadOnlyForm;
