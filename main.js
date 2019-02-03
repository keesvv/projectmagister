const _ = require('lodash') // eslint-disable-line no-unused-vars
const { default: magister, getSchools } = require('magister.js')
const electron = require('electron') // eslint-disable-line no-unused-vars
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
const isDev = require('electron-is-dev')
const request = require('request')

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
  // Retrieve authentication code
  request('https://raw.githubusercontent.com/simplyGits/magisterjs-authcode/master/code.json', { json: true }, (err, res, code) => {
    var authOptions = {
      username: creds.username,
      password: creds.password
    }

    // Validate the response
    if (!err && res.statusCode === 200) {
      // If successful use the authenticationcode we
      // just retrieved.
      authOptions.authCode = code
    }

    // Retrieve schools
    getSchools(creds.school)
      // Retrieve the right school.
      .then((schools) => schools[0])
      // Authenticate.
      .then((school) => magister(_.merge({ school: school }, authOptions)))
      // Check if authentication was successful.
      .then((m, err) => {
        if (err) {
          mainWin.webContents.send('login-success', false)
        } else {
          global.m = m
          mainWin.webContents.send('login-success', true)
        }
      })
      .catch((err) => {
        if (err.name === 'AuthError') {
          mainWin.webContents.send('login-success', false)
        } else if (!(err instanceof TypeError)) {
          console.log(err)
        }
        // Just call ourselves again, most of the time that fixes the error
        // should probably add a limit though.
        mainWin.webContents.send('validate-creds', creds)
      })
  })
})
ipcMain.on('validate-token', (event, creds) => {
  // Retrieve authentication code
  request('https://raw.githubusercontent.com/simplyGits/magisterjs-authcode/master/code.json', { json: true }, (err, res, code) => {
    var authOptions = {
      token: creds.token
    }

    // Validate the response
    if (!err && res.statusCode === 200) {
      // If successful use the authenticationcode we
      // just retrieved.
      authOptions.authcode = code
    }

    // Retrieve schools
    getSchools(creds.school)
      // Retrieve the right school.
      .then((schools) => schools[0])
      // Authenticate.
      .then((school) => magister(_.merge({ school: school }, authOptions)))
      // Check if authentication was successful.
      .then((m, err) => {
        if (err) {
          mainWin.webContents.send('token-success', false)
        } else {
          global.m = m
          mainWin.webContents.send('token-success', true)
        }
      }).catch((err) => {
        if (!(err instanceof TypeError)) {
          console.log(err)
        }
        mainWin.webContents.send('token-success', false)
      })
  })
})

app.once('ready', function () {
  createWindow()
})
