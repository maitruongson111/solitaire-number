SOLITAIRE NUMBER — MICROSOFT STORE READY PWA SOURCE

Game:
- Name: Solitaire Number
- Language: English
- Type: Lightweight solitaire card game
- Offline support: Yes
- No ads / no analytics / no account
- No runFullTrust capability

GAME RULES
1. Build tableau cards downward from 13 to 1 with alternating red/black colors.
2. Empty tableau columns accept only a 13.
3. Build each foundation by suit from 1 to 13.
4. Click the stock to draw. When empty, click again to recycle the waste.
5. Complete all four foundations to win.

MICROSOFT STORE PACKAGING
Recommended route: package this PWA with PWABuilder for Windows.
This source itself does not request or declare runFullTrust.

Before submitting:
1. Host the folder on HTTPS (GitHub Pages / Cloudflare Pages / Netlify can work).
2. Open the public HTTPS URL in PWABuilder.
3. Choose Windows package.
4. Download the generated MSIX/MSIXBundle.
5. Open AppxManifest.xml from the generated package and verify there is NO:
   - runFullTrust
   - rescap:Capability Name="runFullTrust"
6. Upload the Windows package to Microsoft Partner Center.

Store listing suggestion:
Title: Solitaire Number
Short description: A clean and lightweight solitaire game built around numbered cards.
Category: Games > Card & board
Language: English

IMPORTANT:
Replace the support email in privacy-policy.txt before publishing.
