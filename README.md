# AGICOOM Landing Page Estate 2026

Landing statica per acquisizione lead locali da campagne Meta Ads.

Dominio consigliato: `https://analisi.agicoom.com`

## Pubblicazione

Il file `CNAME` configura GitHub Pages per il dominio personalizzato `analisi.agicoom.com`.

DNS Aruba consigliato: record CNAME `analisi` verso `sstefano63.github.io`.

## File principali

- `index.html`: landing principale
- `grazie.html`: thank-you page con evento Meta Lead dopo consenso marketing
- `privacy.html`: informativa privacy dedicata alla landing
- `cookie.html`: cookie policy dedicata alla landing
- `styles.css`: stile mobile-first
- `script.js`: consenso, Pixel Meta e invio form
- `apps-script/Code.gs`: endpoint Google Apps Script per salvare i lead nel Google Sheet

Campi lead: Nome, Telefono obbligatorio, Email opzionale, Nome attivita, Comune, zona/post campagna.

## Configurazione Apps Script

1. Aprire il Google Sheet `AGICOOM - Lead Landing Page Estate 2026`.
2. Andare su Estensioni > Apps Script.
3. Incollare il contenuto di `apps-script/Code.gs`.
4. Distribuire come App web:
   - Esegui come: me
   - Accesso: chiunque abbia il link
5. Copiare l'URL Web App generato.
6. Inserire l'URL in `script.js`, dentro `CONFIG.appsScriptUrl`.

Lo script invia una email transazionale di conferma al lead solo se il campo Email e' compilato e valido. Dopo modifiche a `apps-script/Code.gs`, creare una nuova versione del deployment Apps Script e autorizzare anche l'invio email.

## Meta Pixel

Pixel ID configurato: `1715327215350220`.

Il Pixel viene caricato solo dopo consenso marketing. L'evento `Lead` viene inviato solo su `grazie.html`.
