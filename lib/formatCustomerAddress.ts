export type CustomerAddressLike = {
  firstName?: string | null;
  lastName?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  state?: string | null;
  postcode?: string | null;
  phone?: string | null;
  country?: string | null;
};

export function hasSavedAddress(
  address?: CustomerAddressLike | null
): boolean {
  return Boolean(
    address?.firstName?.trim() ||
      address?.lastName?.trim() ||
      address?.address1?.trim() ||
      address?.city?.trim() ||
      address?.phone?.trim()
  );
}

export function formatCustomerAddress(
  address: CustomerAddressLike
): string {
  const name = [address.firstName, address.lastName]
    .filter(Boolean)
    .join(" ");
  const locality = [address.city, address.state, address.postcode]
    .filter(Boolean)
    .join(", ");

  return [name, address.address1, address.address2, locality, address.phone]
    .filter(Boolean)
    .join("\n");
}
