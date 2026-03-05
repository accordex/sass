"use client";
import React from "react";
import TitleCard from "../../shared/TitleBorderCard";
import {
  Accordion,
  Label,
  TextInput,
  Textarea,
  Radio,
  Button,
  AccordionPanel,
  AccordionTitle,
  AccordionContent,
} from "flowbite-react";

const CollapsibalForm = () => {
  return (
    <div>
      <TitleCard title="Collapsible Section">
        <div>
          <Accordion collapseAll>
            <AccordionPanel>
              <AccordionTitle className="text-lg font-semibold">
                Delivery Address
              </AccordionTitle>
              <AccordionContent>
                <div className="grid grid-cols-12 gap-[1.875rem]">
                  <div className="lg:col-span-6 col-span-12 flex flex-col gap-[1.875rem]">
                    <div className="grid grid-cols-12 gap-7 items-center">
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
                    <div className="grid grid-cols-12 gap-7 items-center">
                      <div className="col-span-3">
                        <Label htmlFor="address">Address</Label>
                      </div>
                      <div className="col-span-9">
                        <Textarea
                          id="address"
                          placeholder="150, Ring Road"
                          required
                          className="form-control-textarea"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-12 gap-7 items-center">
                      <div className="col-span-3">
                        <Label htmlFor="city">City</Label>
                      </div>
                      <div className="col-span-9">
                        <TextInput
                          className="form-control"
                          id="city"
                          type="text"
                          placeholder="Jackson"
                          sizing="md"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-12 gap-7 items-start">
                      <div className="col-span-3">
                        <Label htmlFor="addresstype">Address Type</Label>
                      </div>
                      <div className="col-span-9">
                        <div className="flex items-center gap-2 pb-5">
                          <Radio
                            id="membership"
                            name="membership"
                            value="free"
                            defaultChecked
                          />
                          <Label htmlFor="membership">
                            Home (All day delivery)
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Radio
                            id="paid"
                            name="membership"
                            value="paid"
                            defaultChecked
                          />
                          <Label htmlFor="paid">
                            Office (Delivery between 10 AM - 5 PM)
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6 col-span-12 flex flex-col gap-[1.875rem]">
                    <div className="grid grid-cols-12 gap-7 items-center">
                      <div className="col-span-3">
                        <Label htmlFor="phone">Phone No</Label>
                      </div>
                      <div className="col-span-9">
                        <TextInput
                          className="form-control"
                          id="phone"
                          type="text"
                          placeholder="425 7545 6321"
                          sizing="md"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-12 gap-7 items-center">
                      <div className="col-span-3">
                        <Label htmlFor="pincode">Pincode</Label>
                      </div>
                      <div className="col-span-9">
                        <TextInput
                          className="form-control"
                          id="pincode"
                          type="text"
                          placeholder="687541"
                          sizing="md"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-12 gap-7 items-center">
                      <div className="col-span-3">
                        <Label htmlFor="landmark">Landmark</Label>
                      </div>
                      <div className="col-span-9">
                        <TextInput
                          className="form-control"
                          id="landmark"
                          type="text"
                          placeholder="Nr. Wall Street"
                          sizing="md"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionPanel>

            <AccordionPanel>
              <AccordionTitle className="text-lg font-semibold">
                Delivery Options
              </AccordionTitle>
              <AccordionContent>
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2">
                    <Radio
                      id="standard"
                      name="parcel"
                      value="standard"
                      defaultChecked
                    />
                    <Label htmlFor="standard">Standard 3-5 Days</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio
                      id="express"
                      name="parcel"
                      value="express"
                      defaultChecked
                    />
                    <Label htmlFor="express">Express</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio
                      id="overnight"
                      name="parcel"
                      value="overnight"
                      defaultChecked
                    />
                    <Label htmlFor="overnight">Overnight</Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionPanel>

            <AccordionPanel>
              <AccordionTitle className="text-lg font-semibold">
                Payment Method
              </AccordionTitle>
              <AccordionContent>
                <div className="flex items-center gap-5 py-[1.875rem]">
                  <div className="flex items-center gap-2">
                    <Radio
                      id="cardpayment"
                      name="payment"
                      value="Credit/Debit/ATM Card"
                      defaultChecked
                    />
                    <Label htmlFor="cardpayment">Credit/Debit/ATM Card</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio
                      id="cashondelivery"
                      name="payment"
                      value="cashondeliver"
                      defaultChecked
                    />
                    <Label htmlFor="cashondelivery">Cash on Delivery</Label>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-[1.875rem]">
                  <div className="lg:col-span-7 col-span-12">
                    <div className="col-span-3 mb-2">
                      <Label htmlFor="cardnumber">Card Number</Label>
                    </div>
                    <div className="col-span-9">
                      <TextInput
                        className="form-control"
                        id="cardnumber"
                        type="number"
                        placeholder="1250 4521 5630 2390"
                        sizing="md"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-7 col-span-12 grid grid-cols-9 gap-[1.875rem]">
                    <div className="lg:col-span-5 col-span-12">
                      <div className="mb-2">
                        <Label htmlFor="name">Name</Label>
                      </div>
                      <TextInput
                        className="form-control"
                        id="name"
                        type="text"
                        placeholder="Name"
                        sizing="md"
                      />
                    </div>

                    <div className="lg:col-span-2 col-span-12">
                      <div className="mb-2">
                        <Label htmlFor="expiredate">Exp. Date</Label>
                      </div>
                      <TextInput
                        className="form-control"
                        id="expiredate"
                        type="number"
                        placeholder="MM/YY"
                        sizing="md"
                      />
                    </div>

                    <div className="lg:col-span-2 col-span-12">
                      <div className="mb-2">
                        <Label htmlFor="cvvnumber">CVV Code</Label>
                      </div>
                      <TextInput
                        className="form-control"
                        id="cvvnumber"
                        type="number"
                        placeholder="528"
                        sizing="md"
                      />
                    </div>
                  </div>

                  <div className="col-span-7 flex items-center gap-4">
                    <Button type="submit" color="primary">
                      Submit
                    </Button>
                    <Button type="reset" color="error">
                      Cancel
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionPanel>
          </Accordion>
        </div>
      </TitleCard>
    </div>
  );
};

export default CollapsibalForm;
