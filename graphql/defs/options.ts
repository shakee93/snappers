import { gql } from '@apollo/client';

export const GET_OPTIONS = gql`
query OptionsTopBar {
  topBarBgColor
  topBarBeforeText
  topBarHighlightedText
  topBarAfterText
  topBarHighlightedColor
  topBarButtonLink
  topBarButtonText
}
`

export const GET_PRICE_FLUCTUATION_NOTICE = gql`
query OptionsTopBar {
  topBarPriceFluctuationNotice
}
`