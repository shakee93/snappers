import { siteConfig } from "@/site.config";

/**
 * Order-total threshold above which PayHere is hidden during a price-fluctuation
 * notice (cards over this amount route to other gateways).
 */
export const PAYHERE_HIDE_THRESHOLD = siteConfig.payment.payhere.hideAboveAmount;
