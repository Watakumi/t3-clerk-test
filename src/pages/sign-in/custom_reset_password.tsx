import React, { SyntheticEvent, useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import type { NextPage } from "next";

const SignInPage: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [successfulFirstFactor, setSuccessfulFirstFactor] = useState(false);
  const [complete, setComplete] = useState(false);

  const { isLoaded, signIn, setActive } = useSignIn();

  if (!isLoaded) {
    return null;
  }

  const create = async (e: SyntheticEvent) => {
    e.preventDefault();

    const { supportedFirstFactors } = await signIn?.create({
      identifier: email,
    });

    const resetPasswordFactor = supportedFirstFactors.find(
      (factor) => factor.strategy === "reset_password_email_code"
    );

    if (!resetPasswordFactor) {
      throw new Error("Reset password strategy not supported");
    }

    if (!("emailAddressId" in resetPasswordFactor)) {
      throw new Error("emailAddressId not found");
    }

    const { emailAddressId } = resetPasswordFactor;

    await signIn
      .prepareFirstFactor({
        strategy: "reset_password_email_code",
        emailAddressId,
      })
      .then((result) => {
        console.log(result);
        setSuccessfulCreation(true);
      });
  };

  const confirmationCode = async (e: SyntheticEvent) => {
    e.preventDefault();

    await signIn
      ?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      })
      .then((result) => {
        console.log(result);
        setSuccessfulFirstFactor(true);
      })
      .catch((err) => console.error("error", err.errors[0].longMessage));
  };

  const reset = async (e: SyntheticEvent) => {
    e.preventDefault();
    await signIn
      ?.resetPassword({
        password,
        signOutOfOtherSessions: true,
      })
      .then((result) => {
        if (result.status === "needs_second_factor") {
          console.log(result);
        } else if (result.status === "complete") {
          setActive({ session: result.createdSessionId });
          setComplete(true);
        } else {
          console.log(result);
        }
      })
      .catch((err) => console.error("error", err.errors[0].longMessage));
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!successfulCreation) {
      await create(e);
    } else if (!successfulFirstFactor) {
      await confirmationCode(e);
    } else {
      await reset(e);
    }
  };

  return (
    <div
      style={{
        margin: "auto",
        maxWidth: "500px",
      }}
    >
      <h1>Forgot Password ?</h1>
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1em",
        }}
        onSubmit={handleSubmit}
      >
        {!successfulCreation && !successfulFirstFactor && !complete && (
          <>
            <label htmlFor="email">Please provide identifier</label>
            <input
              type="email"
              placeholder="e.g john@doe.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button>Sign in</button>
          </>
        )}

        {successfulCreation && !successfulFirstFactor && !complete && (
          <>
            <label htmlFor="password">Reset password code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <button>Reset</button>
          </>
        )}

        {successfulCreation && successfulFirstFactor && !complete && (
          <>
            <label htmlFor="password">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        )}

        {complete && "You successfully changed you password"}
      </form>
    </div>
  );
};

export default SignInPage;
