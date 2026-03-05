"use client";

// ==============================================================================
// Login Form Component — Connected to NextAuth
// ==============================================================================
// Handles email/password login using NextAuth credential provider.
// Features:
//   - Client-side validation (Zod)
//   - Loading state
//   - Error display
//   - Remember device checkbox (placeholder for future session persistence)
//   - Redirect after successful login
// ==============================================================================

import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

const AuthLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Basic client-side validation
      if (!email || !password) {
        setError("Please enter your email and password");
        setIsLoading(false);
        return;
      }

      // Call NextAuth signIn with credentials provider
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        // NextAuth returns the error message from our authorize() function
        setError(result.error === "CredentialsSignin" 
          ? "Invalid email or password" 
          : result.error);
        setIsLoading(false);
        return;
      }

      // Successful login — redirect to dashboard or callback URL
      router.push(callbackUrl);
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

        {/* Email field */}
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="login-email">Email Address</Label>
          </div>
          <TextInput
            id="login-email"
            type="email"
            sizing="md"
            className="form-control"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        {/* Password field */}
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="login-password">Password</Label>
          </div>
          <TextInput
            id="login-password"
            type="password"
            sizing="md"
            className="form-control"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex justify-between my-5">
          <div className="flex items-center gap-2">
            <Checkbox id="remember-device" className="checkbox" />
            <Label
              htmlFor="remember-device"
              className="opacity-90 font-normal cursor-pointer"
            >
              Remember this Device
            </Label>
          </div>
          <Link
            href={"/auth/auth1/forgot-password"}
            className="text-primary text-sm font-medium"
          >
            Forgot Password ?
          </Link>
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
              Signing in...
            </div>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </>
  );
};

export default AuthLogin;
