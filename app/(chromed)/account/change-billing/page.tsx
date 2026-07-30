import AccountSubmitButton from "@/components/account/AccountSubmitButton";
import {
  accountLinkClassName,
  accountPageTitleClassName,
} from "@/components/account/accountStyles";

const AccountBilling = () => {
  return (
    <div>
      <div className="space-y-10 sm:space-y-12">
        <h2 className={accountPageTitleClassName}>Payments & payouts</h2>
        <div className="prose prose-slate max-w-2xl dark:prose-invert">
          <span>
            When you receive a payment for a order, we call that payment to you
            a &ldquo;payout.&ldquo; Our secure payment system supports several
            payout methods, which can be set up below.
            <br />
            <br />
            To get paid, you need to set up a payout method. Payouts release
            about 24 hours after a guest’s scheduled time. The time it takes for
            the funds to appear in your account depends on your payout method.{" "}
            <a className={accountLinkClassName} href="##">
              Learn more
            </a>
          </span>
          <div className="pt-10">
            <AccountSubmitButton>Add payout method</AccountSubmitButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountBilling;
