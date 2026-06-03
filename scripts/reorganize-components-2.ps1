$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

function Move-Comp($from, $to) {
  if (-not (Test-Path $from)) { return }
  $dir = Split-Path $to -Parent
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  git mv $from $to
}

# primitives — move subfolders individually (avoids Windows dir lock on whole tree)
$primSubs = @("archive", "Filters", "Heading", "Label", "Loading", "Skeletons")
foreach ($sub in $primSubs) {
  Move-Comp "components/primitives/$sub" "components/global/primitives/$sub"
}
$primFiles = @(
  "AttributeIcon.tsx", "AttributeMappingsInitializer.tsx", "InstantSearchWrapper.tsx",
  "LegalMarkdown.tsx", "MobileFilterSheet.tsx", "NcInputNumber.tsx", "OrderPageSkeleton.tsx",
  "ProductGridInstant.tsx", "SearchInput.tsx", "SortInput.tsx", "TabFilters.tsx"
)
foreach ($f in $primFiles) {
  Move-Comp "components/primitives/$f" "components/global/primitives/$f"
}

# header (remaining)
Move-Comp "components/layout/globalComponents/NavLinks.tsx" "components/header/NavLinks.tsx"
Move-Comp "components/layout/globalComponents/SearchBar.tsx" "components/header/SearchBar.tsx"
Move-Comp "components/layout/globalComponents/MobileBottomNav.tsx" "components/header/MobileBottomNav.tsx"
Move-Comp "components/layout/globalComponents/MobileNavLinks.tsx" "components/header/MobileNavLinks.tsx"
Move-Comp "components/layout/globalComponents/mega-menu" "components/header/mega-menu"
Move-Comp "components/layout/globalComponents/header.tsx" "components/header/Header.tsx"
Move-Comp "components/layout/Header/AvatarDropdown.tsx" "components/header/AvatarDropdown.tsx"
Move-Comp "components/layout/Header/CartDropdownItem.tsx" "components/header/CartDropdownItem.tsx"
Move-Comp "components/layout/Header/LogoutButton.tsx" "components/header/LogoutButton.tsx"
Move-Comp "components/layout/SideCart" "components/header/SideCart"
Move-Comp "components/layout/TopBarPromotion.tsx" "components/header/TopBarPromotion.tsx"

# footer
Move-Comp "components/layout/globalComponents/footer.tsx" "components/footer/Footer.tsx"

# pages
Move-Comp "components/ui/HomePage" "components/home"
Move-Comp "components/ui/TestimonialsSlider.tsx" "components/home/TestimonialsSlider.tsx"
Move-Comp "components/ui/TikTokSection.tsx" "components/home/TikTokSection.tsx"
Move-Comp "components/ui/SingleProductPage" "components/product"
Move-Comp "components/ui/SingleProductBlock" "components/product/SingleProductBlock"
Move-Comp "components/layout/globalComponents/UpsellProducts.tsx" "components/product/UpsellProducts.tsx"
Move-Comp "components/ui/Account" "components/account"
Move-Comp "components/ui/LoginSignupPage" "components/auth"

Write-Host "Phase 2 complete."
