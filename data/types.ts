//  ######  CustomLink  ######## //
export interface CustomLink {
  label: string;
  href: string;
  targetBlank?: boolean;
}

export type TwMainColor =
  | "pink"
  | "green"
  | "yellow"
  | "red"
  | "indigo"
  | "blue"
  | "purple"
  | "gray";

//

export type contactInformation = {
  phone: string;
  email: string;
  displayName: string;
}

export type Slug = {
  'order-id': string;
};

export type OrderPaymentPageProps = {
  params: Slug;
};



export type PaymentDetailsType = {
  sandbox?: boolean;
  merchant_id?: string;
  return_url?: string;
  cancel_url?: string;
  notify_url?: string;
  hash?: string | null;
  order_id?: string;
  items?: string;
  amount?: string;
  currency?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: "Sri Lanka";
};

export type PaymentDetailsWithoutUrls = Omit<PaymentDetailsType,
    'sandbox' | 'merchant_id' | 'return_url' | 'cancel_url' | 'notify_url' | 'hash'>;


