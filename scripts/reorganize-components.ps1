# One-off: regroup components by page / global / header / footer
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

function Move-Comp($from, $to) {
  $dir = Split-Path $to -Parent
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  if (Test-Path $from) {
    git mv $from $to
  } else {
    Write-Warning "Skip missing: $from"
  }
}

# --- global ---
Move-Comp "components/brand" "components/global/brand"
Move-Comp "components/theme" "components/global/theme"
Move-Comp "components/layout/ContentWrapper.tsx" "components/global/layout/ContentWrapper.tsx"
Move-Comp "components/layout/GoogleAnalytics.tsx" "components/global/layout/GoogleAnalytics.tsx"
Move-Comp "components/layout/NavigationEvents.tsx" "components/global/layout/NavigationEvents.tsx"
Move-Comp "components/layout/WhatsAppLogo.tsx" "components/global/layout/WhatsAppLogo.tsx"
Move-Comp "components/primitives" "components/global/primitives"

Move-Comp "components/ui/AddressPageComps" "components/global/forms"
Move-Comp "components/ui/Payment" "components/global/payment"
Move-Comp "components/ui/Notifications" "components/global/ui/notifications"

$globalUi = @(
  "button.tsx", "sheet.tsx", "carousel.tsx", "Prices.tsx", "ProductCard3.tsx",
  "LikeButton.tsx", "IconDiscount.tsx", "ModalQuickView.tsx", "BackdropSpinner.tsx",
  "BrandCard.tsx", "LineOrCartPriceLabel.tsx", "NotifyAddTocart.tsx", "PreOrderNotice.tsx",
  "OrderBankReceiptUpload.tsx", "SectionSliderProductCard.tsx", "SectionSliderBrandCard.tsx",
  "ProductQuickView3.tsx", "BgGlassmorphism", "CardCategories", "Email"
)
foreach ($f in $globalUi) {
  Move-Comp "components/ui/$f" "components/global/ui/$f"
}

# --- header ---
$headerFiles = @(
  "HeaderContent.tsx", "HeaderClientWrapper.tsx", "HeaderGate.tsx", "HeaderSearchResults.tsx",
  "Logo.tsx", "NavLinks.tsx", "SearchBar.tsx", "MobileBottomNav.tsx", "MobileNavLinks.tsx"
)
foreach ($f in $headerFiles) {
  Move-Comp "components/layout/globalComponents/$f" "components/header/$f"
}
Move-Comp "components/layout/globalComponents/mega-menu" "components/header/mega-menu"
Move-Comp "components/layout/globalComponents/header.tsx" "components/header/Header.tsx"
Move-Comp "components/layout/Header/AvatarDropdown.tsx" "components/header/AvatarDropdown.tsx"
Move-Comp "components/layout/Header/CartDropdownItem.tsx" "components/header/CartDropdownItem.tsx"
Move-Comp "components/layout/Header/LogoutButton.tsx" "components/header/LogoutButton.tsx"
Move-Comp "components/layout/SideCart" "components/header/SideCart"
Move-Comp "components/layout/TopBarPromotion.tsx" "components/header/TopBarPromotion.tsx"

# --- footer ---
Move-Comp "components/layout/globalComponents/footer.tsx" "components/footer/Footer.tsx"

# --- page groups ---
Move-Comp "components/ui/HomePage" "components/home"
Move-Comp "components/ui/TestimonialsSlider.tsx" "components/home/TestimonialsSlider.tsx"
Move-Comp "components/ui/TikTokSection.tsx" "components/home/TikTokSection.tsx"
Move-Comp "components/ui/SingleProductPage" "components/product"
Move-Comp "components/ui/SingleProductBlock" "components/product/SingleProductBlock"
Move-Comp "components/layout/globalComponents/UpsellProducts.tsx" "components/product/UpsellProducts.tsx"
Move-Comp "components/ui/Account" "components/account"
Move-Comp "components/ui/LoginSignupPage" "components/auth"

Write-Host "Done moving files."
