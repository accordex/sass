"use client"
import { IconUser, IconMail, IconLock } from "@tabler/icons-react";
import { Label, TextInput, Checkbox, Button } from "flowbite-react";
import React from "react";
import TitleCard from "../../shared/TitleBorderCard";

const FormWithRightIcon = () => {
  return (
    <div>
      <TitleCard title="Form with Right Icon">
        <div className="grid grid-cols-6 gap-6">
          <div className="col-span-12">
            <Label htmlFor="username">Username</Label>
            <TextInput
              className="form-control mt-2"
              id="username"
              type="text"
              rightIcon={() => <IconUser size={20} />}
              placeholder="your username"
              required
            />
          </div>
          <div className="col-span-12">
            <Label htmlFor="email">Email</Label>
            <TextInput
              className="form-control mt-2"
              id="email"
              type="email"
              rightIcon={() => <IconMail size={20} />}
              placeholder="name@materialm.com"
              required
            />
          </div>
          <div className="col-span-12">
            <Label htmlFor="password">Password</Label>
            <TextInput
              className="form-control mt-2"
              id="password"
              type="password"
              rightIcon={() => <IconLock size={20} />}
              placeholder="Password"
              required
            />
          </div>
          <div className="col-span-12">
            <Label htmlFor="confirmpassword">Confirm Password</Label>
            <TextInput
              className="form-control mt-2"
              id="confirmpassword"
              type="password"
              rightIcon={() => <IconLock size={20} />}
              placeholder="Confirm Password"
              required
            />
          </div>
          <div className="flex items-center gap-2 col-span-12">
            <Checkbox className="checkbox" id="remember" />
            <Label htmlFor="remember">Remember Me!</Label>
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

export default FormWithRightIcon;
