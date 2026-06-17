import { redirect } from "next/navigation";

export default function AccountOrdersRedirect() {
  redirect("/account?tab=orders");
}
