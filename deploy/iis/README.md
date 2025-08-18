# IIS deployment (Azure Windows VM)

This repo contains multiple static sites that map to subdomains:

- deenshield.alhaqds.software → DeenShield site
- deenshield.extension.alhaqds.software → DeenShield Extension
- deenshield.app.alhaqds.software → DeenShield App
- alhaqds.software → Main site

## IIS folder layout on the VM

Create these folders on the VM:

- C:\\inetpub\\main
- C:\\inetpub\\deenshield
- C:\\inetpub\\deenshield_extension
- C:\\inetpub\\deenshield_app

## What to copy from this repo

- Main site (alhaqds.software): copy the root HTML files and the `assets/` folder.
- DeenShield brand (deenshield.alhaqds.software):
  - Landing: `deenshield/main.html` (canonical entry)
  - Policies/support: copy `deenshield/privacy/`, `deenshield/terms/`, `deenshield/support/` (each has ar/en/fa/ps)
  - If the landing references shared styles/images, also copy the root `assets/` here
- DeenShield Extension (deenshield.extension.alhaqds.software):
  - Copy the entire `deenshield/extension/` folder (contains localized `ar/ en/ fa/ ps/`)
- DeenShield App (deenshield.app.alhaqds.software):
  - Copy `deenshield/web-app/src/` as the PWA (index.html, about.html, privacy-policy.html, assets/, images/, js/, styles/)
  - Optionally copy `deenshield/web-app/ar|en|fa|ps/` localized landing folders if you want paths like `/fa/` to resolve

Note: ensure relative links resolve (keep `assets/` in each site folder or adjust basePath).

## IIS site bindings (one per subdomain)

For each site in IIS Manager:

- Physical path → one of the folders above
- Bindings:
  - HTTP: 20.68.171.64:80 host header set to the subdomain
  - HTTPS: 20.68.171.64:443 host header set to the subdomain (after SSL)

## SSL

- Use win-acme (Let’s Encrypt) on the VM to issue certs for:
- alhaqds.software
- www.alhaqds.software (CNAME to apex)
- deenshield.alhaqds.software
- deenshield.extension.alhaqds.software
- deenshield.app.alhaqds.software

## Optional: PowerShell helper

See `setup-sites.ps1` to automate folder creation and IIS site bindings.
