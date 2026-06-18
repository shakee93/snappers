import { redirect } from "next/navigation";

export default function AccountAddressRedirect() {
  redirect("/account?tab=address");
}
