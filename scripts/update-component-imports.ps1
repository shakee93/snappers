$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

$replacements = @(
  @{ Old = '@/components/layout/globalComponents/footer'; New = '@/components/footer/Footer' },
  @{ Old = '@/components/layout/globalComponents/header'; New = '@/components/header/Header' },
  @{ Old = '@/components/layout/globalComponents/UpsellProducts'; New = '@/components/product/UpsellProducts' },
  @{ Old = '@/components/layout/globalComponents/'; New = '@/components/header/' },
  @{ Old = '@/components/layout/Header/'; New = '@/components/header/' },
  @{ Old = '@/components/layout/SideCart/'; New = '@/components/header/SideCart/' },
  @{ Old = '@/components/layout/TopBarPromotion'; New = '@/components/header/TopBarPromotion' },
  @{ Old = '@/components/layout/ContentWrapper'; New = '@/components/global/layout/ContentWrapper' },
  @{ Old = '@/components/layout/GoogleAnalytics'; New = '@/components/global/layout/GoogleAnalytics' },
  @{ Old = '@/components/layout/NavigationEvents'; New = '@/components/global/layout/NavigationEvents' },
  @{ Old = '@/components/layout/WhatsAppLogo'; New = '@/components/global/layout/WhatsAppLogo' },
  @{ Old = '@/components/ui/AddressPageComps/'; New = '@/components/global/forms/' },
  @{ Old = '@/components/ui/Payment/'; New = '@/components/global/payment/' },
  @{ Old = '@/components/ui/HomePage/'; New = '@/components/home/' },
  @{ Old = '@/components/ui/SingleProductPage/'; New = '@/components/product/' },
  @{ Old = '@/components/ui/SingleProductBlock/'; New = '@/components/product/SingleProductBlock/' },
  @{ Old = '@/components/ui/Account/'; New = '@/components/account/' },
  @{ Old = '@/components/ui/LoginSignupPage/'; New = '@/components/auth/' },
  @{ Old = '@/components/ui/Notifications/'; New = '@/components/global/ui/notifications/' },
  @{ Old = '@/components/ui/TestimonialsSlider'; New = '@/components/home/TestimonialsSlider' },
  @{ Old = '@/components/ui/TikTokSection'; New = '@/components/home/TikTokSection' },
  @{ Old = '@/components/ui/BackdropSpinner'; New = '@/components/global/ui/BackdropSpinner' },
  @{ Old = '@/components/ui/BgGlassmorphism/'; New = '@/components/global/ui/BgGlassmorphism/' },
  @{ Old = '@/components/ui/BrandCard'; New = '@/components/global/ui/BrandCard' },
  @{ Old = '@/components/ui/button'; New = '@/components/global/ui/button' },
  @{ Old = '@/components/ui/carousel'; New = '@/components/global/ui/carousel' },
  @{ Old = '@/components/ui/CardCategories/'; New = '@/components/global/ui/CardCategories/' },
  @{ Old = '@/components/ui/Email/'; New = '@/components/global/ui/Email/' },
  @{ Old = '@/components/ui/IconDiscount'; New = '@/components/global/ui/IconDiscount' },
  @{ Old = '@/components/ui/LikeButton'; New = '@/components/global/ui/LikeButton' },
  @{ Old = '@/components/ui/LineOrCartPriceLabel'; New = '@/components/global/ui/LineOrCartPriceLabel' },
  @{ Old = '@/components/ui/ModalQuickView'; New = '@/components/global/ui/ModalQuickView' },
  @{ Old = '@/components/ui/NotifyAddTocart'; New = '@/components/global/ui/NotifyAddTocart' },
  @{ Old = '@/components/ui/OrderBankReceiptUpload'; New = '@/components/global/ui/OrderBankReceiptUpload' },
  @{ Old = '@/components/ui/PreOrderNotice'; New = '@/components/global/ui/PreOrderNotice' },
  @{ Old = '@/components/ui/Prices'; New = '@/components/global/ui/Prices' },
  @{ Old = '@/components/ui/ProductCard3'; New = '@/components/global/ui/ProductCard3' },
  @{ Old = '@/components/ui/ProductQuickView3'; New = '@/components/global/ui/ProductQuickView3' },
  @{ Old = '@/components/ui/SectionSliderBrandCard'; New = '@/components/global/ui/SectionSliderBrandCard' },
  @{ Old = '@/components/ui/SectionSliderProductCard'; New = '@/components/global/ui/SectionSliderProductCard' },
  @{ Old = '@/components/ui/sheet'; New = '@/components/global/ui/sheet' },
  @{ Old = '@/components/brand/'; New = '@/components/global/brand/' },
  @{ Old = '@/components/theme/'; New = '@/components/global/theme/' },
  @{ Old = '@/components/primitives/'; New = '@/components/global/primitives/' }
)

$files = Get-ChildItem -Recurse -Include *.ts,*.tsx -File |
  Where-Object { $_.FullName -notmatch '\\(\.next|node_modules)\\' }

$count = 0
foreach ($file in $files) {
  $content = [IO.File]::ReadAllText($file.FullName)
  $original = $content
  foreach ($r in $replacements) {
    $content = $content.Replace($r.Old, $r.New)
  }
  if ($content -ne $original) {
    [IO.File]::WriteAllText($file.FullName, $content)
    $count++
  }
}
Write-Host "Updated imports in $count files."
