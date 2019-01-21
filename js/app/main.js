/* globals Vue, remote, electron, path, fs, moment, sendNotify, ipcRenderer, credsFile, initData, $, refreshHomework, showInfoDialog, dialogError, getSchools, dialogQuestion, os, download, shell, spawn */
var app = new Vue({
  el: '#app',
  data: {
    isBeta: false,
    isRefreshCooldown: false,
    isUpdateRunning: false,
    isSettingsMenu: false,
    agendaDate: '',
    showDoneHomework: false,
    showReadMail: false,
    auth: {
      schoolQuery: [],
      saveCreds: true,
      loginIncorrect: false,
      schoolIncorrect: false,
      isGuest: false,
      isBusy: false,
      loginSuccess: false,
      creds: {
        school: '',
        username: '',
        password: '',
        token: ''
      }
    },
    isLoaded: {
      appointments: false,
      messages: false,
      grades: false,
      assignments: false,
      tests: false,
      files: false
    },
    profile: {
      username: 'Onbekende gebruiker',
      userDesc: '',
      imgUrl: './img/icons/user.png'
    },
    magister: {
      appointments: [],
      messages: [],
      grades: [],
      assignments: [],
      tests: [],
      insights: [],
      files: [],
      filterMessages (readState, maxMessages = 8) {
        let array = []
        for (let i = 0; i < this.messages.length; i++) {
          if (i === maxMessages) {
            break
          }

          const element = this.messages[i]
          if (element.isRead === readState) { array.push(element) }
        }

        return array
      },
      filterHomework (doneState) {
        let array = []

        for (let i = 0; i < this.appointments.length; i++) {
          const element = this.appointments[i]
          if (element.isDone === doneState &&
                        element.content !== undefined &&
                        element.infoType === 1) { array.push(element) }
        }

        return array
      },
      parseGrade (grade) {
        if (!isNaN(parseFloat(grade.grade.replace(',', '.'))) &&
                    grade.weight > 0 && grade.counts) {
          return parseFloat(grade.grade.replace(',', '.'))
        }
      },
      gradeToString (gradeFloat) {
        return gradeFloat.toString().replace('.', ',')
      },
      getLastGrades (maxItems = 5) {
        let lastGrades = []
        for (let i = 0; i < this.grades.length; i++) {
          if (lastGrades.length === maxItems) { break }

          const element = this.grades[i]
          if (element.type.header == null &&
                    element.weight > 0) {
            lastGrades.push(element)
          }
        }

        return lastGrades
      },
      isFailed (grade) {
        let gradeFloat
        gradeFloat = parseFloat(grade.replace(',', '.'))
        return gradeFloat < 5.5
      },
      isWellDone (grade) {
        let gradeFloat
        gradeFloat = parseFloat(grade.replace(',', '.'))
        return gradeFloat > 8.0
      },
      downloadAttachment (file) {
        var downloadsPath = electron.getPath('downloads')
        var filePath = path.join(downloadsPath, file.name)
        var fileStream = fs.createWriteStream(filePath)

        fileStream.on('open', () => {
          file.download()
            .then((stream) => {
              console.log(stream)

              stream.on('data', (data) => {
                fileStream.write(data)
              })

              // shell.openItem(filePath)
            })
        })
      }
    },
    formatTime (date) {
      return moment(date).format('H:mm')
    },
    formatDateHuman (date) {
      if (date !== undefined && date != null) {
        return moment(date).format('LL')
      } else {
        return null
      }
    },
    getDateDifference (date1, date2, returnRawDays) {
      var firstConvert = moment(date1)
      var secondConvert = moment(date2)
      var diff = moment(secondConvert.diff(firstConvert, 'days'))

      if (!returnRawDays) { return diff } else { return diff._i + 1 }
    },
    trimContent (str, maxLength = 120) {
      let element = document.createElement('p')
      let finalString
      element.innerHTML = str
      finalString = element.textContent || element.innerText || ''

      finalString = finalString
        .split('\n').join(' ')
        .split('\r').join(' ')

      if (finalString.length > maxLength) {
        finalString = finalString.substring(0, maxLength - 3) + '...'
      }

      return finalString
    },
    getFileIcon (fileName) {
      var extIndex = fileName.lastIndexOf('.')
      var ext = fileName.substring(extIndex + 1)

      if (ext === 'doc' || ext === 'docx') {
        return 'fa-file-word'
      } else if (ext === 'ppt' || ext === 'pptx' || ext === 'ppsx') {
        return 'fa-file-powerpoint'
      } else if (ext === 'xls' || ext === 'xlsx') {
        return 'fa-file-excel'
      } else if (ext === 'pdf') {
        return 'fa-file-pdf'
      } else {
        return 'fa-file'
      }
    },
    getAttachmentTitle (file) {
      return 'Naam:\t' + file.name + '\n' +
    'Grootte:\t' + Math.round(file.size / 1024) + ' KB' + '\n\n' +
    'Klik om te downloaden.'
    }
  },
  computed: {
    isAuthFormFilled: function () {
      return this.auth.creds.school.length > 0 &&
        this.auth.creds.username.length > 0 &&
        this.auth.creds.password.length > 0
    }
  },
  methods: {
    login (useToken = false) {
      app.auth.isBusy = true
      app.auth.loginIncorrect = false
      app.auth.schoolIncorrect = false
      app.auth.loginSuccess = false

      app.getSchools(() => {
        if (app.auth.schoolQuery.length === 0) {
          app.auth.schoolIncorrect = true
          app.auth.isBusy = false
          sendNotify('De schoolnaam die je hebt ingevoerd bestaat niet. Check of je de volledige naam hebt gebruikt van de school.', 'error')
          return
        }

        if (useToken) {
          ipcRenderer.send('validate-token', app.auth.creds)
        } else {
          ipcRenderer.send('validate-creds', app.auth.creds)
        }

        ipcRenderer.once('login-success', (event, isSuccess) => {
          if (isSuccess) {
            app.auth.loginSuccess = true
            app.auth.isBusy = false

            app.auth.creds.token = remote.getGlobal('m').token
            app.auth.creds.password = '' // Assures it can't be read from console anymore

            if (app.auth.saveCreds) {
              let rawJson = `{"school": "${app.auth.creds.school}", "username": "${app.auth.creds.username}", "token": "${app.auth.creds.token}"}`
              fs.writeFile(credsFile, rawJson, 'utf8', (err) => {
                if (err) {
                  console.log('Unable to save credentials to file: ' + err)
                }
              })
            }

            initData()
          } else {
            app.auth.loginIncorrect = true
            app.auth.isBusy = false
            sendNotify('Je gebruikersnaam en/of wachtwoord kloppen niet.', 'error')
          }
        })
        ipcRenderer.once('token-success', (event, isSuccess) => {
          if (isSuccess) {
            app.auth.loginSuccess = true
            app.auth.isBusy = false

            initData()
          } else {
            app.auth.loginIncorrect = false
            app.auth.isBusy = false
            app.auth.token = ''
          }
        })
      })
    },
    signOff () {
      if (!app.auth.saveCreds) {
        try {
          fs.unlinkSync(credsFile)
        } catch (err) {
          if (err.code !== 'ENOENT') {
            dialogError(err.message)
            electron.quit()
          }
        }

        app.auth.schoolQuery = []
        app.auth.creds = {
          school: '',
          username: '',
          password: '',
          token: ''
        }
      } else {
        let rawJson = `{"school": "${app.auth.creds.school}", "username": "${app.auth.creds.username}", "token": ""}`
        fs.writeFile(credsFile, rawJson, 'utf8', (err) => {
          if (err) {
            console.log('Unable to save credentials to file: ' + err)
          }
        })
      }

      // When logging off delete the token
      app.auth.creds.token = ''

      app.isSettingsMenu = false
      app.auth.loginSuccess = false
    },
    toggleSettings () {
      app.isSettingsMenu = !app.isSettingsMenu
    },
    toggleActionBar (event) {
      const element = event.target
      if ($(element).parents('div').hasClass('btnPanel') ||
            $(element).hasClass('btnPanel')) {
        return
      }

      const btnPanel = $(element).parents('div').find('.btnPanel')[0]
      $(btnPanel).toggleClass('shown')
    },
    toggleHomeworkState (appointment) {
      appointment.isDone = !appointment.isDone
      appointment.saveChanges()
      refreshHomework()

      if (appointment.isDone) {
        sendNotify('Huiswerk is afgerond!', 'success')
      } else {
        sendNotify('Huiswerk gemarkeerd als onafgerond.', 'success')
      }
    },
    showAppointmentInfo (appointment) {
      var tableData = [
        { 'name': 'Datum', 'value': this.formatDateHuman(appointment.start) },
        { 'name': 'Locatie', 'value': appointment.location },
        { 'name': 'Docent' + (appointment.teachers.length === 1 ? '' : 'en'),
          'value': `${appointment.teachers[0].fullName} (${appointment.teachers[0].teacherCode})` }
      ]

      if (appointment.content != null) {
        tableData.push({ 'name': 'Afgerond', 'value': appointment.isDone ? 'Ja' : 'Nee' })
      }

      showInfoDialog(appointment.classes[0], tableData, appointment.content)
    },
    showGradeInfo (grade) {
      var tableData = [
        { 'name': 'Beschrijving', 'value': grade.description },
        { 'name': 'Datum van afname', 'value': this.formatDateHuman(grade.testDate) },
        { 'name': 'Invoerdatum', 'value': this.formatDateHuman(grade.dateFilledIn) },
        { 'name': 'Weging', 'value': grade.weight.toString() }
      ]

      showInfoDialog(grade.class.description, tableData, null, 'gradeInfo', grade.grade)
    },
    showAssignmentInfo (assignment) {
      var tableData = [
        { 'name': 'Vak', 'value': assignment.class },
        { 'name': 'Deadline', 'value': this.formatDateHuman(assignment.deadline) },
        { 'name': 'Ingeleverd op', 'value': this.formatDateHuman(assignment.handedInOn) },
        { 'name': 'Voltooid', 'value': assignment.finished ? 'Ja' : 'Nee' }
      ]

      showInfoDialog(assignment.name, tableData, assignment.description, 'assignmentInfo', 'fas fa-edit')
    },
    showTestInfo (test) {
      var tableData = [
        { 'name': 'Datum', 'value': this.formatDateHuman(test.start) },
        { 'name': 'Locatie', 'value': test.location },
        { 'name': 'Docent' + (test.teachers.length === 1 ? '' : 'en'),
          'value': `${test.teachers[0].fullName} (${test.teachers[0].teacherCode})` }
      ]

      let testType
      if (test.infoType === 2) testType = 'Proefwerk'
      else if (test.infoType === 4) testType = 'Schriftelijke overhoring'
      else if (test.infoType === 5) testType = 'Mondelinge overhoring'
      else testType = 'Overig'

      tableData.push({ 'name': 'Type', 'value': testType })

      showInfoDialog(test.classes[0], tableData, test.content, 'testInfo', 'fas fa-exclamation')
    },
    browse (magisterFolder) {
      sendNotify('Het is momenteel nog niet mogelijk om te browsen door Bestanden.', 'error')
    },
    getSchools (callback = null) {
      getSchools(this.auth.creds.school)
        .then((schools) => {
          app.auth.schoolQuery = schools
          if (callback != null) callback()
        })
    },
    verifyInstall (updateData, releaseData) {
      app.isUpdateRunning = false

      dialogQuestion(
        `Er is een update beschikbaar, versie ${releaseData.tag_name}. ` +
        'Hij is al gedownload op je computer.\nWil je hem nu installeren?',
        'Update',
        ['Installeer nu', 'Later'], 1,
        function (response) {
          var install = response === 0
          if (install) {
            app.installUpdates(updateData)
          }
        }
      )
    },
    downloadUpdates (releaseData) {
      app.isUpdateRunning = true

      let targetPlatform
      let targetUrl
      let targetFilename

      switch (os.type()) {
        case 'Windows_NT':
          targetPlatform = 'windows'
          break
        case 'Linux':
          targetPlatform = 'linux'
          break
        case 'Darwin':
          targetPlatform = 'macOS'
          break
      }

      for (let i = 0; i < releaseData.assets.length; i++) {
        const element = releaseData.assets[i]
        if (element.name.indexOf(targetPlatform) !== -1) {
          targetUrl = element.browser_download_url
          targetFilename = element.name
        }
      }

      var downloadsPath = electron.getPath('downloads')
      var filePath = path.join(downloadsPath, targetFilename)

      var updateData = {
        targetPlatform: targetPlatform,
        targetUrl: targetUrl,
        targetFilename: targetFilename,
        targetPath: filePath
      }

      if (fs.existsSync(filePath)) {
        this.verifyInstall(updateData, releaseData)
        return
      }

      download(targetUrl, downloadsPath).then(() => {
        this.verifyInstall(updateData, releaseData)
      })
    },
    installUpdates (updateData) {
      if (updateData.targetPlatform === 'windows') {
        var installerProcess = spawn(updateData.targetPath, ['/silent'], {
          detached: true
        })

        installerProcess.unref()
      } else {
        shell.showItemInFolder(updateData.targetPath)
      }

      electron.quit()
    },
    checkUpdates () {
      var url = 'https://api.github.com/repos/deltaproject/Delta/releases'
      $.getJSON(url, function (data) {
        $.getJSON(`https://raw.githubusercontent.com/deltaproject/Delta/${data[0].tag_name}/package.json`, function (packageData) {
          var currentVersion = electron.getVersion()
          var latestVersion = packageData.version
          if (currentVersion !== latestVersion) {
            app.downloadUpdates(data[0])
          }
        })
      })
    },
    setRefreshCooldown () {
      this.isRefreshCooldown = true

      setTimeout(() => {
        this.isRefreshCooldown = false
      }, 2500)
    }
  }
})
