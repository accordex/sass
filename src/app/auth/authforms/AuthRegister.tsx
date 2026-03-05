"use client";

// ==============================================================================
// Registration Form Component — Creates Tenant + Admin User
// ==============================================================================
// Handles new organization signup. Creates:
//   1. A new Tenant (organization) with trial subscription
//   2. The first admin user for that tenant
//   3. Assigns tenant_admin role automatically
//
// After successful registration, auto-logs in and redirects to dashboard.
// ==============================================================================

import { Button, Label, TextInput } from "flowbite-react";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { registerAction } from "@/app/actions/auth";

const AuthRegister = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const result = await registerAction(formData);

      if (!result.success) {
        setError(result.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Successful registration — redirect to dashboard
      router.push("/");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <form className="mt-6" onSubmit={handleSubmit}>
        {/* Error message display */}
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Company Name — creates the tenant */}
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="company_name">Company / Organization Name</Label>
          </div>
          <TextInput
            id="company_name"
            name="company_name"
            type="text"
            sizing="md"
            className="form-control"
            placeholder="e.g., Acme Corporation"
            disabled={isLoading}
            required
          />
        </div>

        {/* Name fields in a row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="first_name">First Name</Label>
            </div>
            <TextInput
              id="first_name"
              name="first_name"
              type="text"
              sizing="md"
              className="form-control"
              placeholder="John"
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="last_name">Last Name</Label>
            </div>
            <TextInput
              id="last_name"
              name="last_name"
              type="text"
              sizing="md"
              className="form-control"
              placeholder="Doe"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="reg-email">Email Address</Label>
          </div>
          <TextInput
            id="reg-email"
            name="email"
            type="email"
            sizing="md"
            className="form-control"
            placeholder="you@company.com"
            disabled={isLoading}
            required
          />
        </div>

        {/* Phone (optional) */}
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="phone">Phone Number (optional)</Label>
          </div>
          <TextInput
            id="phone"
            name="phone"
            type="tel"
            sizing="md"
            className="form-control"
            placeholder="+91 9876543210"
            disabled={isLoading}
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="reg-password">Password</Label>
          </div>
          <TextInput
            id="reg-password"
            name="password"
            type="password"
            sizing="md"
            className="form-control"
            placeholder="Min 8 chars, uppercase, lowercase & number"
            disabled={isLoading}
            required
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <div className="mb-2 block">
            <Label htmlFor="confirm_password">Confirm Password</Label>
          </div>
          <TextInput
            id="confirm_password"
            name="confirm_password"
            type="password"
            sizing="md"
            className="form-control"
            placeholder="Re-enter your password"
            disabled={isLoading}
            required
          />
        </div>

        {/* Submit button */}
        <Button
          color={"primary"}
          type="submit"
          className="rounded-md w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
              Creating your account...
            </div>
          ) : (
            "Start Free Trial"
          )}
        </Button>

        {/* Trial info */}
        <p className="text-xs text-center text-gray-500 mt-3">
          14-day free trial • No credit card required
        </p>
      </form>
    </>
  );
};

export default AuthRegister;
