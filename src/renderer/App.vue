<template>
  <div id="app">
    <div id="notifyContainer">
      <div v-for="notification in this.notifications" :id="notification.id" class="notification" :class="notification.level">
        {{ notification.message }}
      </div>
    </div>
    <login-section ref="loginSection"></login-section>

    <status-bar ref="statusBar"></status-bar>
    <settings-flyout ref="settingsFlyout"></settings-flyout>
    
    <agenda-card ref="agendaCard"></agenda-card>
    <homework-card ref="homeworkCard"></homework-card>
    <assignments-card ref="assignmentsCard"></assignments-card>
    <messages-card ref="messagesCard""></messages-card>

    <div id="notifyContainer"></div>
  </div>
</template>

<script>
  import LoginSection from '@/components/LoginSection'
  import StatusBar from '@/components/StatusBar'
  import SettingsFlyout from '@/components/SettingsFlyout'
  import AgendaCard from '@/components/AgendaCard'
  import HomeworkCard from '@/components/HomeworkCard'
  import AssignmentsCard from '@/components/AssignmentsCard'
  import MessagesCard from '@/components/MessagesCard'

  const { remote } = require('electron')
  const app = remote.app
  const path = require('path')
  const axios = require('axios')
  const compareVersions = require('compare-versions')
  const os = require('os')
  const download = require('download')
  const fs = require('fs')
  const moment = require('moment')
  const uuid = require('uuid/v4')
  const _ = require('lodash')
  
  moment.locale('nl')

  export default {
    name: 'delta',
    components: {
      LoginSection,
      StatusBar,
      SettingsFlyout,
      AgendaCard,
      HomeworkCard,
      AssignmentsCard,
      MessagesCard
    },
    data: function () {
      return {
        magister: undefined,
        files: {
          schoolFile: path.join(app.getPath('userData'), 'school.json'),
          credentialsFile: path.join(app.getPath('userData'), 'credentials.json')
        },
        state: {
          busy: false,
          update: {
            checking: false,
            downloading: false
          },
          cached: {
            profile: false,
            appointments: false,
            homework: false,
            assignments: false,
            files: false,
            messages: false
          },
          show: {
            settings: false
          }
        },
        cache: {
          profile: {
            name: ''
          },
          appointments: [],
          homework: [],
          assignments: [],
          folders: [],
          messageFolders: []
        },
        notifications: []
      }
    },
    watch: {
      magister (newMagister, oldMagister) {
        if (newMagister !== undefined && oldMagister === undefined) {
          // The user most likely logged in
          this.loadCache()

          // Check for updates
          this.update()
        } else if (newMagister === undefined && oldMagister !== undefined) {
          // The user most likely logged out
          this.clearCache()
        }
      },
      'state.cached': {
        deep: true,
        handler (newCached, oldCached) {
          // Check if anything has not been cached yet
          var cachedValues = Object.values(newCached)
          for (var i = cachedValues.length - 1; i >= 0; i--) {
            if (cachedValues[i] === false) {
              // If so then we are busy
              this.state.busy = true
              return
            }
          }

          // Everything has been cached -> not busy
          this.state.busy = false
        }
      }
    },
    methods: {
      login () {
        this.$refs.loginSection.login()
      },
      logout () {
        this.state.show.settings = false
        this.$refs.loginSection.logout()
      },
      clearCache () {
        this.cache.profile.name = ''
        this.cache.appointments = []
        this.cache.homework = []
        this.cache.assignments = []
        this.cache.folders = []
        this.cache.messageFolders = []

        // Reset cache state
        var cachedKeys = Object.keys(this.state.cached)
        for (var i = cachedKeys.length - 1; i >= 0; i--) {
          this.state.cached[cachedKeys[i]] = false
        }
      },
      notify (message, level, duration = 10) {
        var notificationID = uuid()

        this.notifications.push({
          message: message,
          level: level,
          id: notificationID
        })

        _.delay(() => {
          this.notifications = this.notifications.filter((notification) => {
            return notification.id !== notificationID
          })
        }, duration * 1000)
      },
      async getFiles (parent) {
        return parent.files()
      },
      async getFolders (parent) {
        var folders
        if (parent === undefined) {
          folders = await this.magister.fileFolders()
        } else {
          folders = await parent.folders()
        }

        for (var i = folders.length - 1; i >= 0; i--) {
          var folder = folders[i]

          folder.folders = await this.getFolders(folder)
          folder.files = await this.getFiles(folder)
        }

        return folders
      },
      async loadCache () {
        this.clearCache()

        // These dates are passed to magister.js, that's why it are Date objects and not Moment objects.
        var from = new Date() // Today
        var to = new Date(from.getTime() + ((12 - from.getDay()) * 24 * 60 * 60 * 1000)) // Next week Friday

        // CACHE profile data
        this.cache.profile.name = this.magister.profileInfo.getFullName()
        this.state.cached.profile = true

        // CACHE appointments and homework
        this.cache.appointments = (await this.magister.appointments(from, to)).map((appointment) => {
          var description = appointment.classes[0] || appointment.description
          description = description.charAt(0).toUpperCase() + description.slice(1)

          appointment.description = description

          if (appointment.infoType === 1 && appointment.content !== undefined) {
            this.cache.homework.push({
              finished: appointment.isDone,
              description: appointment.content,
              class: description,
              _appointment: appointment
            })
          }

          return appointment
        })

        this.state.cached.appointments = true
        this.state.cached.homework = true

        // CACHE assignments
        Promise.all((await this.magister.assignments()).map(async (assignment) => {
          assignment.versions = await assignment.versions() // Fetch the version history
          return assignment
        })).then((assignments) => {
          this.cache.assignments = assignments // Once it resolved set the assignment array
        })

        this.state.cached.assignments = true

        // CACHE folders and files
        this.cache.folders = await this.getFolders()

        this.state.cached.files = true

        // CACHE messages
        this.cache.messageFolders = (await this.magister.messageFolders()).filter(messageFolder => ![].includes(messageFolder.type))
        for (var i = this.cache.messageFolders.length - 1; i >= 0; i--) {
          var messageFolder = this.cache.messageFolders[i]
          messageFolder.messages = (await messageFolder.messages({ count: null, fill: false, fillPersons: false })).messages
          messageFolder.unreadCount = messageFolder.messages.filter(message => !message.isRead).length
        }

        this.state.cached.messages = true
      },
      async update () {
        // Do not check for updates if we are in guest mode.
        if (this.$refs.loginSection.guestMode) { return }
        // Start with checking if there is an update
        this.state.update.checking = true

        try {
          // Get the latest release
          var release = (await axios.get('https://api.github.com/repos/deltaproject/Delta/releases/latest')).data
          // Get the version of the release
          var releaseVersion = (await axios.get(`https://raw.githubusercontent.com/deltaproject/Delta/${release.tag_name}/package.json`)).data.version
          var localVersion = app.getVersion()

          // Check if the remote version is newer
          this.state.update.checking = false // We are done checking
          // Note: if you local version is newer (git clone?) then you
          // can set this to !== 1 in order to test if downloading works.
          if (compareVersions(releaseVersion, localVersion) === 1) {
            this.state.update.downloading = true // From here we are downloading

            // Figure out what platform we're on
            var platform
            switch (os.type()) {
              case 'Windows_NT':
                platform = 'windows'
                break
              case 'Darwin':
                platform = 'macOS'
                break
              default:
                platform = 'linux'
            }

            // Figure out where from and to we should
            // download the update
            var downloadURL
            var fileName
            for (let i = 0; i < release.assets.length; i++) {
              if (release.assets[i].name.indexOf(platform) !== -1) {
                downloadURL = release.assets[i].browser_download_url
                fileName = release.assets[i].name
              }
            }
            var downloadPath = path.join(app.getPath('downloads'), fileName)

            // Check if we already downloaded the
            // update before
            if (!fs.existsSync(downloadPath)) {
              // File does not exist -> download it
              await download(downloadURL, downloadPath)
            }

            // Done downloading
            this.state.update.downloading = false

            // TODO: Let the user now the download is available.
          }
        } catch (err) {
          console.log(`An error occured whilst trying to update Delta: ${err.message}`)

          // Reset the states
          this.state.update.checking = false
          this.state.update.downloading = false
        }
      }
    }
  }
</script>

<style lang="scss">
  @import 'assets/scss/main/master.scss'
</style>
