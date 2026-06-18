import AccountInput from "@/components/account/AccountInput";
import AccountSubmitButton from "@/components/account/AccountSubmitButton";
import Label from "@/components/global/primitives/Label/Label";
import {
  accountFormClassName,
  accountLabelClassName,
  accountPageTitleClassName,
} from "@/components/account/accountStyles";

const AccountPass = () => {
  return (
    <div>
      <div className="space-y-10 sm:space-y-12">
        <h2 className={accountPageTitleClassName}>Update your password</h2>
        <div className={accountFormClassName}>
          <div>
            <Label className={accountLabelClassName}>Current password</Label>
            <AccountInput type="password" />
          </div>
          <div>
            <Label className={accountLabelClassName}>New password</Label>
            <AccountInput type="password" />
          </div>
          <div>
            <Label className={accountLabelClassName}>Confirm password</Label>
            <AccountInput type="password" />
          </div>
          <div className="pt-2">
            <AccountSubmitButton>Update password</AccountSubmitButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPass;
