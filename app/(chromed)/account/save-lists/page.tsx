import { redirect } from "next/navigation";

export default function AccountWishlistRedirect() {
  redirect("/account?tab=wishlist");
}
