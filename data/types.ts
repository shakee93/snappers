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

