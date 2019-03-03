/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

/* eslint-disable */

// Install `electron-debug` with `devtron`
require('electron-debug')({ showDevTools: true })

import { app } from 'electron'

// Install `vue-devtools`
app.on('ready', () => {
  let installExtension = require('electron-devtools-installer')
  installExtension.default(installExtension.VUEJS_DEVTOOLS)
    .then(() => {})
    .catch(err => {
      console.log('Unable to install `vue-devtools`: \n', err)
    })
})

// Fix paths, version and app name
const { productName, version } = require('../../package.json')
app.setVersion(version)
app.setName(productName)

app.setPath('userData', require('path').join(app.getPath('appData'), productName))

// Require `main` process to boot app
require('./index')