var SHEET_ID = '17pyzz8DA9V1z7FdWIn56FEAxtsrZVfYs1Twp7GC3sNk';
var SHEET_NAME = 'Lead';
var NOTIFY_EMAIL = '';
var REPLY_TO_EMAIL = 'info@agicoom.it';
var CONFIRMATION_FROM_NAME = 'AGICOOM';
var WHATSAPP_PHONE = '349 064 6346';
var WHATSAPP_URL = 'https://wa.me/393490646346';
var LOGO_URL = 'https://analisi.agicoom.com/assets/agicoom-logo.png';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var payload = JSON.parse(e.postData && e.postData.contents ? e.postData.contents : '{}');
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    sheet.appendRow([
      new Date(),
      clean_(payload.nome),
      clean_(payload.telefono),
      clean_(payload.email),
      clean_(payload.attivita),
      clean_(payload.comune),
      clean_(payload.zona),
      clean_(payload.post),
      'da richiamare',
      ''
    ]);

    if (NOTIFY_EMAIL) {
      safeSendEmail_({
        to: NOTIFY_EMAIL,
        subject: 'Nuovo lead landing AGICOOM',
        body: [
          'Nuovo lead dalla landing analisi.agicoom.com',
          '',
          'Nome: ' + clean_(payload.nome),
          'Telefono: ' + clean_(payload.telefono),
          'Email: ' + clean_(payload.email),
          'Attivita: ' + clean_(payload.attivita),
          'Comune: ' + clean_(payload.comune),
          'Zona: ' + clean_(payload.zona),
          'Post: ' + clean_(payload.post)
        ].join('\n')
      });
    }

    sendLeadConfirmation_(payload);

    return json_({ result: 'success' });
  } catch (error) {
    return json_({ result: 'error', message: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function sendLeadConfirmation_(payload) {
  var email = clean_(payload.email);

  if (!isEmail_(email)) {
    return;
  }

  var nome = firstName_(payload.nome);
  var greeting = nome ? 'Ciao ' + nome + ',' : 'Ciao,';
  var plainBody = [
    greeting,
    '',
    "grazie per aver richiesto l'analisi gratuita della tua presenza online.",
    '',
    'Abbiamo ricevuto i tuoi dati e ti ricontatteremo a breve per un primo confronto rapido e concreto sulla visibilita della tua attivita nelle province di Vercelli, Biella e Novara.',
    '',
    'Durante il check guarderemo insieme alcuni elementi chiave: presenza su Google, sito, social e reputazione online.',
    '',
    'Se preferisci anticiparci qualcosa, puoi rispondere direttamente a questa email oppure scriverci su WhatsApp al ' + WHATSAPP_PHONE + '.',
    WHATSAPP_URL,
    '',
    'A presto,',
    'AGICOOM',
    'Comunicazione Efficace'
  ].join('\n');

  safeSendEmail_({
    to: email,
    subject: 'Abbiamo ricevuto la tua richiesta di analisi gratuita',
    name: CONFIRMATION_FROM_NAME,
    replyTo: REPLY_TO_EMAIL,
    body: plainBody,
    htmlBody: confirmationHtmlBody_(greeting)
  });
}

function confirmationHtmlBody_(greeting) {
  var containerStyle = 'margin:0;padding:0;background:#ffffff;color:#252121;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;';
  var innerStyle = 'max-width:620px;margin:0 auto;padding:24px 0;';
  var paragraphStyle = 'margin:0 0 16px;';
  var buttonStyle = 'display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;';
  var iconStyle = 'display:inline-block;width:18px;height:18px;line-height:18px;border-radius:50%;background:#ffffff;color:#25D366;text-align:center;font-weight:bold;margin-right:8px;';

  return [
    '<div style="' + containerStyle + '">',
    '<div style="' + innerStyle + '">',
    '<p style="' + paragraphStyle + '">' + escapeHtml_(greeting) + '</p>',
    '<p style="' + paragraphStyle + '">grazie per aver richiesto l&apos;analisi gratuita della tua presenza online.</p>',
    '<p style="' + paragraphStyle + '">Abbiamo ricevuto i tuoi dati e ti ricontatteremo a breve per un primo confronto rapido e concreto sulla visibilit&agrave; della tua attivit&agrave; nelle province di Vercelli, Biella e Novara.</p>',
    '<p style="' + paragraphStyle + '">Durante il check guarderemo insieme alcuni elementi chiave: presenza su Google, sito, social e reputazione online.</p>',
    '<p style="margin:24px 0;"><a href="' + WHATSAPP_URL + '" style="' + buttonStyle + '"><span style="' + iconStyle + '">&#9742;</span>Scrivici su WhatsApp</a></p>',
    '<p style="' + paragraphStyle + '">Se preferisci anticiparci qualcosa, puoi rispondere direttamente a questa email.</p>',
    '<div style="margin-top:28px;padding-top:18px;border-top:1px solid #e7e0da;">',
    '<img src="' + LOGO_URL + '" width="190" alt="AGICOOM Comunicazione Efficace" style="display:block;width:190px;max-width:100%;height:auto;margin:0 0 8px;">',
    '<div style="font-size:13px;color:#6d625c;">Comunicazione Efficace</div>',
    '</div>',
    '</div>',
    '</div>'
  ].join('');
}

function safeSendEmail_(message) {
  try {
    MailApp.sendEmail(message);
  } catch (error) {
    Logger.log('Email non inviata: ' + error);
  }
}

function isEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean_(value));
}

function firstName_(value) {
  return clean_(value).split(/\s+/)[0];
}

function escapeHtml_(value) {
  return clean_(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clean_(value) {
  return String(value || '').trim();
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
