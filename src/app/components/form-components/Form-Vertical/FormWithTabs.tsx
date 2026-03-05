"use client";
import {
  Tabs,
  Label,
  TextInput,
  Select,
  Datepicker,
  Button,
  TabItem,
} from "flowbite-react";
import React from "react";
import TitleCard from "../../shared/TitleBorderCard";

const FormWithTabs = () => {
  return (
    <div>
      <TitleCard title="Form with Tabs">
        <Tabs aria-label="Full width tabs" className="gap-6">
          <TabItem active title="Personal Info">
            <div className="grid grid-cols-12 gap-6">
              <div className="lg:col-span-6 col-span-12 flex flex-col gap-6">
                <div className="grid grid-cols-12 gap-7 items-center">
                  <div className="col-span-3">
                    <Label htmlFor="firstname">First Name</Label>
                  </div>
                  <div className="col-span-9">
                    <TextInput
                      className="form-control"
                      id="firstname"
                      type="text"
                      placeholder="John"
                      sizing="md"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-7 items-center">
                  <div className="col-span-3">
                    <Label htmlFor="country">Country</Label>
                  </div>
                  <div className="col-span-9">
                    <Select id="country" required className="select-md">
                      <option>India</option>
                      <option>Europe</option>
                      <option>Franch</option>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-7 items-center">
                  <div className="col-span-3">
                    <Label htmlFor="birthdate">Birth Date</Label>
                  </div>
                  <div className="col-span-9">
                    <Datepicker className="form-control" />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-6 col-span-12 flex flex-col gap-6">
                <div className="grid grid-cols-12 gap-7 items-center">
                  <div className="col-span-3">
                    <Label htmlFor="lastname">Last Name</Label>
                  </div>
                  <div className="col-span-9">
                    <TextInput
                      className="form-control"
                      id="lastname"
                      type="text"
                      placeholder="Deo"
                      sizing="md"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-7 items-center">
                  <div className="col-span-3">
                    <Label htmlFor="language">Language</Label>
                  </div>
                  <div className="col-span-9">
                    <Select id="language" required className="select-md">
                      <option>English</option>
                      <option>Franch</option>
                      <option>Spanish</option>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-7 items-center">
                  <div className="col-span-3">
                    <Label htmlFor="phone">Phone No</Label>
                  </div>
                  <div className="col-span-9">
                    <TextInput
                      className="form-control"
                      id="phone"
                      type="text"
                      placeholder="958 1475 458"
                      sizing="md"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-5 mt-30">
              <Button type="submit" color="primary">
                Submit
              </Button>
              <Button type="reset" color="error">
                Cancel
              </Button>
            </div>
          </TabItem>
          <TabItem title="Account Details">
            <div className="grid grid-cols-12 gap-6">
              <div className="lg:col-span-6 col-span-12 flex flex-col gap-6">
                <div className="grid grid-cols-12 gap-7 items-center">
                  <div className="col-span-3">
                    <Label htmlFor="username">Username</Label>
                  </div>
                  <div className="col-span-9">
                    <TextInput
                      className="form-control"
                      id="username"
                      type="text"
                      placeholder="John.Deo"
                      sizing="md"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-7 items-center">
                  <div className="col-span-3">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <div className="col-span-9">
                    <TextInput
                      className="form-control"
                      id="password"
                      type="text"
                      placeholder="john.deo"
                      sizing="md"
                    />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-6 col-span-12 flex flex-col gap-6">
                <div className="grid grid-cols-12 gap-7 items-center">
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
                <div className="grid grid-cols-12 gap-7 items-center">
                  <div className="col-span-3">
                    <Label htmlFor="confirm">Confirm</Label>
                  </div>
                  <div className="col-span-9">
                    <TextInput
                      className="form-control"
                      id="confirm"
                      type="text"
                      placeholder="john.deo"
                      sizing="md"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-5 mt-30">
              <Button type="submit" color="primary">
                Submit
              </Button>
              <Button type="reset" color="error">
                Cancel
              </Button>
            </div>
          </TabItem>
          <TabItem title="Social Links">
            <div className="grid grid-cols-12 gap-6">
              <div className="lg:col-span-6 col-span-12 flex flex-col gap-6">
                <div className="grid grid-cols-12 gap-7 items-center">
                  <div className="col-span-3">
                    <Label htmlFor="twitter">Twitter</Label>
                  </div>
                  <div className="col-span-9">
                    <TextInput
                      className="form-control"
                      id="twitter"
                      type="text"
                      placeholder="https://twitter.com/abc"
                      sizing="md"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-7 items-center">
                  <div className="col-span-3">
                    <Label htmlFor="google">Google</Label>
                  </div>
                  <div className="col-span-9">
                    <TextInput
                      className="form-control"
                      id="google"
                      type="text"
                      placeholder="https://plus.google.com/abc"
                      sizing="md"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-7 items-center">
                  <div className="col-span-3">
                    <Label htmlFor="instagram">Instagram</Label>
                  </div>
                  <div className="col-span-9">
                    <TextInput
                      className="form-control"
                      id="instagram"
                      type="text"
                      placeholder="https://instagram.com/abc"
                      sizing="md"
                    />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-6 col-span-12 flex flex-col gap-6">
                <div className="grid grid-cols-12 gap-7 items-center">
                  <div className="col-span-3">
                    <Label htmlFor="facebook">Facebook</Label>
                  </div>
                  <div className="col-span-9">
                    <TextInput
                      className="form-control"
                      id="facebook"
                      type="text"
                      placeholder="https://facebook.com/abc"
                      sizing="md"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-7 items-center">
                  <div className="col-span-3">
                    <Label htmlFor="linkedin">Linkedin</Label>
                  </div>
                  <div className="col-span-9">
                    <TextInput
                      className="form-control"
                      id="linkedin"
                      type="text"
                      placeholder="https://linkedin.com/abc"
                      sizing="md"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-7 items-center">
                  <div className="col-span-3">
                    <Label htmlFor="quora">Quora</Label>
                  </div>
                  <div className="col-span-9">
                    <TextInput
                      className="form-control"
                      id="quora"
                      type="text"
                      placeholder="https://quora.com/abc"
                      sizing="md"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-5 mt-30">
              <Button type="submit" color="primary">
                Submit
              </Button>
              <Button type="reset" color="error">
                Cancel
              </Button>
            </div>
          </TabItem>
        </Tabs>
      </TitleCard>
    </div>
  );
};

export default FormWithTabs;
