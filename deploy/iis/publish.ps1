# Publish repo files to IIS folders on a Windows Server
# Run: pwsh ./publish.ps1 -DestRoot "C:\inetpub"
param(
  [string]$DestRoot = "C:\inetpub",
  [switch]$WhatIf
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")

function Ensure-Dir($path) {
  if (-not (Test-Path $path)) { New-Item -ItemType Directory -Path $path | Out-Null }
}

function Copy-Tree($src, $dst) {
  Ensure-Dir $dst
  if ($WhatIf) {
    Write-Host "[DRY] Mirror $src -> $dst" -ForegroundColor Yellow
  } else {
    robocopy $src $dst /MIR /NFL /NDL /NJH /NJS /NP /XD ".git" "deploy" "node_modules" | Out-Null
  }
}

function Copy-List($base, $files, $dst) {
  Ensure-Dir $dst
  foreach ($f in $files) {
    $src = Join-Path $base $f
    if (Test-Path $src) {
      if ($WhatIf) {
        Write-Host "[DRY] Copy $src -> $dst" -ForegroundColor Yellow
      } else {
        Copy-Item $src -Destination $dst -Force
      }
    } else {
      Write-Host "Skip missing: $src" -ForegroundColor DarkGray
    }
  }
}

# Destinations
$mainDst       = Join-Path $DestRoot "main"
$shieldDst     = Join-Path $DestRoot "deenshield"
$extDst        = Join-Path $DestRoot "deenshield_extension"
$appDst        = Join-Path $DestRoot "deenshield_app"

# Source groups
$rootFiles = @(
  "index.html","about.html","contact.html","donate.html","help.html",
  "library.html","services.html","quran.html","projects.html","media.html",
  "introduction.html","all-infographics.html","taleem-ai.html",
  # PWA/offline and IIS config
  "offline.html","sw.js","web.config"
)

# 1) Main site: copy selected root pages + assets/
Copy-List $repoRoot $rootFiles $mainDst
Copy-Tree (Join-Path $repoRoot "assets") (Join-Path $mainDst "assets")

# 2) DeenShield site: landing + dedicated brand assets and localized content
$shieldPage = Join-Path $repoRoot "deenshield\main.html"
if (Test-Path $shieldPage) {
  Copy-List $repoRoot @("deenshield\main.html") $shieldDst
  # Brand-specific assets used by the landing
  $shieldStyles = Join-Path $repoRoot "deenshield\styles"
  $shieldJs     = Join-Path $repoRoot "deenshield\js"
  $shieldImgs   = Join-Path $repoRoot "deenshield\images"
  $shieldComps  = Join-Path $repoRoot "deenshield\components"
  if (Test-Path $shieldStyles) { Copy-Tree $shieldStyles (Join-Path $shieldDst "styles") }
  if (Test-Path $shieldJs)     { Copy-Tree $shieldJs     (Join-Path $shieldDst "js") }
  if (Test-Path $shieldImgs)   { Copy-Tree $shieldImgs   (Join-Path $shieldDst "images") }
  if (Test-Path $shieldComps)  { Copy-Tree $shieldComps  (Join-Path $shieldDst "components") }
  # Localized brand pages (privacy/support/terms)
  $shieldPrivacy = Join-Path $repoRoot "deenshield\privacy"
  $shieldSupport = Join-Path $repoRoot "deenshield\support"
  $shieldTerms   = Join-Path $repoRoot "deenshield\terms"
  if (Test-Path $shieldPrivacy) { Copy-Tree $shieldPrivacy (Join-Path $shieldDst "privacy") }
  if (Test-Path $shieldSupport) { Copy-Tree $shieldSupport (Join-Path $shieldDst "support") }
  if (Test-Path $shieldTerms)   { Copy-Tree $shieldTerms   (Join-Path $shieldDst "terms") }
} else {
  Write-Host "Missing deenshield/main.html" -ForegroundColor DarkYellow
}
Copy-Tree (Join-Path $repoRoot "assets") (Join-Path $shieldDst "assets")

# 4) DeenShield Extension: publish the extension folder or the marketing page if preferred
# Publish the extension marketing/site folder
$extSrcFolder = Join-Path $repoRoot "deenshield\extension"
if (Test-Path $extSrcFolder) {
  Copy-Tree $extSrcFolder $extDst
} else {
  Write-Host "Extension folder missing: $extSrcFolder" -ForegroundColor DarkYellow
}

# 4) DeenShield App: static src/ contents
$appSrc = Join-Path $repoRoot "deenshield\web-app\src"
if (Test-Path $appSrc) {
  Copy-Tree $appSrc $appDst
} else {
  Write-Host "App src missing: $appSrc" -ForegroundColor DarkYellow
}

Write-Host "Publish complete." -ForegroundColor Green
