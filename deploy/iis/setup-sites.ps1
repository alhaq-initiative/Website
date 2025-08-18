# Requires: Run PowerShell as Administrator on the Azure Windows VM
# Purpose: Create IIS sites and bindings for subdomains pointing to folders under C:\inetpub

param(
  [string]$IpAddress = "20.68.171.64",
  [string]$PoolRuntime = "v4.0"
)

Import-Module WebAdministration

$sites = @(
  @{ Name = "MainSite";           Host = "alhaqds.software";                      Path = "C:\inetpub\main" },
  @{ Name = "DeenShield";          Host = "deenshield.alhaqds.software";           Path = "C:\inetpub\deenshield" },
  @{ Name = "DeenShieldExtension"; Host = "deenshield.extension.alhaqds.software"; Path = "C:\inetpub\deenshield_extension" },
  @{ Name = "DeenShieldApp";       Host = "deenshield.app.alhaqds.software";       Path = "C:\inetpub\deenshield_app" }
)

# Create folders if missing
foreach ($s in $sites) {
  if (!(Test-Path $s.Path)) {
    New-Item -ItemType Directory -Path $s.Path | Out-Null
  }
}

# Ensure Default Web Site is stopped to avoid binding conflicts (optional)
if (Test-Path IIS:\Sites\"Default Web Site") {
  Stop-Website -Name "Default Web Site" -ErrorAction SilentlyContinue
}

foreach ($s in $sites) {
  if (!(Test-Path IIS:\Sites\$($s.Name))) {
    New-Website -Name $s.Name -PhysicalPath $s.Path -IPAddress $IpAddress -Port 80 -HostHeader $s.Host | Out-Null
  } else {
    # Update physical path if changed
    Set-ItemProperty IIS:\Sites\$($s.Name) -Name physicalPath -Value $s.Path
  }

  # Ensure HTTP binding exists
  $httpBinding = Get-WebBinding -Name $s.Name -Protocol http -ErrorAction SilentlyContinue | Where-Object { $_.bindingInformation -like "$IpAddress:80:$($s.Host)" }
  if (-not $httpBinding) {
    New-WebBinding -Name $s.Name -Protocol http -IPAddress $IpAddress -Port 80 -HostHeader $s.Host | Out-Null
  }
}

Write-Host "Sites created/updated. Next: issue SSL certs and add HTTPS bindings." -ForegroundColor Green
