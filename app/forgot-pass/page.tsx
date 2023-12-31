import Label from "components/Label/Label";
import React from "react";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import Input from "shared/Input/Input";

const AccountPass = () => {
  return (
    <div className="my-14 sm:mt-20 max-w-4xl mx-auto">
        <div className="space-y-10 sm:space-y-12">
          {/* HEADING */}
          <h2 className="text-2xl sm:text-3xl font-semibold">
            Forgot Password
          </h2>
          <div className=" max-w-xl space-y-6">
            <div>
              <Label>Your Email </Label>
              <Input type="Email" className="mt-1.5" />
            </div>
            {/* <div>
              <Label>New password</Label>
              <Input type="password" className="mt-1.5" />
            </div>
            <div>
              <Label>Confirm password</Label>
              <Input type="password" className="mt-1.5" />
            </div> */}
            <div className="pt-2">
              <ButtonPrimary>Send Link</ButtonPrimary>
            </div>
          </div>
        </div>

    </div>
  );
};

export default AccountPass;
