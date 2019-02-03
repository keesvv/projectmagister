/* globals remote, path, url */
function showInfoDialog (header, tableData, // eslint-disable-line no-unused-vars
  content = null, type = 'appointmentInfo', icon = 'far fa-calendar-check') {
  var infoWin = new remote.BrowserWindow({
    width: 400,
    height: 650,
    show: false,
    frame: false,
    resizable: false,
    icon: path.join(__dirname, 'img/icons/icon@64px.png')
  })

  infoWin.loadURL(url.format({
    pathname: path.join(__dirname, 'info.html'),
    protocol: 'file:',
    slashes: true
  }))

  infoWin.once('ready-to-show', function () {
    infoWin.webContents.send('info-data', {
      header: header,
      content: content,
      tableData: tableData,
      type: type,
      icon: icon
    })

    infoWin.show()
  })
}
