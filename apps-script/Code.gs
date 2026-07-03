var SHEET_ID = '17pyzz8DA9V1z7FdWIn56FEAxtsrZVfYs1Twp7GC3sNk';
var SHEET_NAME = 'Lead';
var NOTIFY_EMAIL = '';

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
      MailApp.sendEmail({
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

    return json_({ result: 'success' });
  } catch (error) {
    return json_({ result: 'error', message: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function clean_(value) {
  return String(value || '').trim();
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
