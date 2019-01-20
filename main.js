const _ = require('lodash') // eslint-disable-line no-unused-vars
const { default: magister, getSchools } = require('magister.js')
const electron = require('electron') // eslint-disable-line no-unused-vars
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
const isDev = require('electron-is-dev')

if (isDev) {
  require('electron-reload')(__dirname, {
    electron: require(`${__dirname}/node_modules/electron`)
  })
}

let mainWin

function createWindow () {
  mainWin = new BrowserWindow({
    width: 1220,
    height: 800,
    show: false,
    frame: false,
    icon: path.join(__dirname, 'img/icons/icon@64px.png')
  })

  mainWin.on('closed', function () {
    app.quit()
  })

  mainWin.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWin.once('ready-to-show', function () {
    mainWin.show()
    if (process.argv.includes('--debug')) {
      mainWin.webContents.openDevTools()
    }
  })
}

ipcMain.on('validate-creds', (event, creds) => {
  getSchools(creds.school)
    .then((schools) => schools[0])
    .then((school) => magister({
      school,
      username: creds.username,
      password: creds.password
    }))
    .then((m, err) => {
      if (err) {
        mainWin.webContents.send('login-success', false)
      } else {
        global.m = m
        mainWin.webContents.send('login-success', true)
      }
    })
})

app.once('ready', function () {
  createWindow()
})
