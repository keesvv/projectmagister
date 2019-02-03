/* globals Vue, close */
var ipc = require('electron').ipcRenderer

var app = new Vue({
  el: '#app',
  data: {
    header: '',
    content: null,
    type: '',
    icon: '',
    tableData: []
  },
  methods: {
    closeInfo () {
      close()
    }
  }
})

ipc.on('info-data', function (event, data) {
  app.header = data.header
  app.content = data.content
  app.type = data.type
  app.icon = data.icon

  data.tableData.forEach(i => {
    if (i.value != null && i.value !== undefined && i.value !== '') {
      app.tableData.push(i)
    }
  })
})

document.body.addEventListener('keyup', function (event) {
  if (event.keyCode === 27) {
    app.closeInfo()
  }
})
