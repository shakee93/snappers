import { gql } from "@apollo/client";

/** Site-wide ACF options from WP `siteSettings` (extend fields here as needed). */
export const GET_SITE_SETTINGS = gql`
  query SiteSettings {
    siteSettings {
      siteSettingFields {
        dealEnds
        videoUrlOfHowToOrderSection
      }
    }
  }
`;

export type SiteSettingFields = {
  dealEnds?: string | null;
  videoUrlOfHowToOrderSection?: string | null;
};
