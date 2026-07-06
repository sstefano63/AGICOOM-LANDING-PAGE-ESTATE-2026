var SHEET_ID = '17pyzz8DA9V1z7FdWIn56FEAxtsrZVfYs1Twp7GC3sNk';
var SHEET_NAME = 'Lead';
var NOTIFY_EMAIL = '';
var REPLY_TO_EMAIL = 'info@agicoom.it';
var CONFIRMATION_FROM_NAME = 'AGICOOM';
var WHATSAPP_PHONE = '349 064 6346';
var WHATSAPP_URL = 'https://wa.me/393490646346';

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

  safeSendEmail_({
    to: email,
    subject: 'Abbiamo ricevuto la tua richiesta di analisi gratuita',
    name: CONFIRMATION_FROM_NAME,
    replyTo: REPLY_TO_EMAIL,
    body: [
      greeting,
      '',
      "grazie per aver richiesto l'analisi gratuita della tua presenza online.",
      '',
      "Abbiamo ricevuto i tuoi dati e ti ricontatteremo a breve per un primo confronto rapido e concreto sulla visibilità della tua attività nelle province di Vercelli, Biella e Novara.",
      '',
      'Durante il check guarderemo insieme alcuni elementi chiave: presenza su Google, sito, social e reputazione online.',
      '',
      'Se preferisci anticiparci qualcosa, puoi rispondere direttamente a questa email oppure scriverci su WhatsApp al ' + WHATSAPP_PHONE + '.',
      WHATSAPP_URL,
      '',
      'A presto,',
      'AGICOOM',
      'Comunicazione Efficace'
    ].join('\n')
  });
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

function clean_(value) {
  return String(value || '').trim();
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
