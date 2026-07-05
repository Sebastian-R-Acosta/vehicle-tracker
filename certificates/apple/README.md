# Apple Wallet Pass Certificates

To generate Apple Wallet passes (`.pkpass`) you need:

### 1. Apple Developer Account
You need an active Apple Developer Program membership ($99/year).

### 2. Create a Pass Type ID
- Go to https://developer.apple.com/account/resources/identifiers/list/passTypeId
- Click "+" → "Pass Type ID"
- Enter a description (e.g. "Bitácora Documents")
- Enter an identifier (e.g. `pass.com.yourdomain.vehicletracker`)
- Register

### 3. Generate Signer Certificate
- On the Pass Type ID detail page, click "Configure"
- Generate a certificate signing request (CSR) from Keychain Access
- Upload the CSR, download the signed certificate
- Double-click the downloaded `.cer` to install in Keychain
- Export the certificate as `.p12`:
  1. Open Keychain Access → My Certificates
  2. Right-click the "Pass Type ID" certificate → Export
  3. Save as `signerCert.p12` into this directory
  4. You may set a password (optional) — set `WALLET_PASS_CERT_PASSWORD` env var if you do

### 4. Download Apple WWDR Certificate
- Download from: https://www.apple.com/certificateauthority/
- Save as `wwdr.pem` in this directory

### 5. Create pass model
Create a `pass.pass` directory (yes, with the `.pass` extension) containing:
```
pass.pass/
├── icon.png          (29x29)
├── icon@2x.png       (58x58)
├── logo.png          (29x29)
├── logo@2x.png       (58x58)
└── pass.json         (minimal, can be empty object {})
```

### 6. Environment Variables
```
APPLE_TEAM_ID="<your 10-character team ID>"
APPLE_PASS_TYPE_ID="pass.com.yourdomain.vehicletracker"
WALLET_PASS_CERT_PASSWORD=""  # only if you set a password on signerCert.p12
```

**Team ID**: https://developer.apple.com/account/#/membership
