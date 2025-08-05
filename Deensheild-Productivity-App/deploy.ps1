# DeenTab Deployment Script
# PowerShell script to prepare files for hosting

Write-Host "🚀 Preparing DeenTab for deployment..." -ForegroundColor Green

# Create deployment directory
$deployDir = ".\deploy"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# Copy source files
Write-Host "📁 Copying source files..." -ForegroundColor Yellow
Copy-Item ".\src\*" -Destination $deployDir -Recurse

# Copy configuration files
Copy-Item ".\netlify.toml" -Destination $deployDir -ErrorAction SilentlyContinue

Write-Host "✅ Deployment ready!" -ForegroundColor Green
Write-Host "📂 Files prepared in: $deployDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Next steps:" -ForegroundColor Blue
Write-Host "1. Upload contents of 'deploy' folder to your hosting"
Write-Host "2. Ensure HTTPS is enabled"
Write-Host "3. Test geolocation permissions"
Write-Host ""
Write-Host "🔗 Recommended hosts:" -ForegroundColor Magenta
Write-Host "- Netlify: netlify.com (drag & drop deploy)"
Write-Host "- GitHub Pages: github.com"
Write-Host "- Your website: upload to subdirectory"
