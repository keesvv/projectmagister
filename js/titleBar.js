/* globals remote, electron, Vue */
var $ = require('jquery/dist/jquery')

function minimizeWindow () { // eslint-disable-line no-unused-vars
  remote.BrowserWindow.getFocusedWindow().minimize()
}

function maximizeWindow () { // eslint-disable-line no-unused-vars
  var win = remote.BrowserWindow.getFocusedWindow()
  if (win.isMaximized()) { win.restore() } else { win.maximize() }
}

function closeWindow (quitOnClose = true) { // eslint-disable-line no-unused-vars
  if (quitOnClose) {
    electron.quit()
  } else {
    remote.BrowserWindow.getFocusedWindow().close()
  }
}

Vue.component('title-bar', {
  template: `
    <div class="titleBar no-select">
        <div class="titleContainer">
            <p>${$('title').html()}</p>
        </div>

        <div class="btnContainer">
            <div id="minimizeBtn" onclick="minimizeWindow()">
                <i class="fas fa-window-minimize"></i>
            </div>

            <div id="maximizeBtn" onclick="maximizeWindow()">
                <i class="far fa-window-maximize"></i>
            </div>

            <div id="closeBtn" onclick="closeWindow()">
                <i class="fas fa-times"></i>
            </div>
        </div>
    </div>
    `
})
