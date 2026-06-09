import { siteConfig } from "@/site.config";

/** Card surcharge applied to card payments (e.g. 0.03 = 3%). */
export const CARD_SURCHARGE_RATE = siteConfig.payment.payhere.cardSurchargeRate;

/**
 * Order-total threshold above which PayHere is hidden during a price-fluctuation
 * notice (cards over this amount route to other gateways).
 */
export const PAYHERE_HIDE_THRESHOLD = siteConfig.payment.payhere.hideAboveAmount;
