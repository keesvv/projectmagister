'use strict'

import { app, BrowserWindow } from 'electron'

/**
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  mainWindow = new BrowserWindow({
    height: 800,
    width: 1220,
    useContentSize: true,
    show: false
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
    app.quit()
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })
}

app.on('ready', createWindow)
