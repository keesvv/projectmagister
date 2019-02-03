/* globals dialog */
function dialogInfo (message) { // eslint-disable-line no-unused-vars
  dialog.showMessageBox({
    title: 'Informatie',
    type: 'info',
    buttons: ['OK'],
    message: message
  })
}

function dialogQuestion (message, title, buttons, cancelId, callback) { // eslint-disable-line no-unused-vars
  dialog.showMessageBox({
    title: title,
    type: 'question',
    buttons: buttons,
    message: message,
    cancelId: cancelId
  }, function (response, checked) {
    callback(response)
  })
}

function dialogError (message) { // eslint-disable-line no-unused-vars
  dialog.showMessageBox({
    title: 'Fout',
    type: 'error',
    buttons: ['OK'],
    message: message
  })
}
