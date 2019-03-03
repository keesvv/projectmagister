<template>
  <div id="authContainer" v-if="!$parent.magister" v-on:keyup="submit">
    <div class="authContent">
      <img src="../assets/imgs/logo.png" class="logo no-select">
      <h1 class="no-select loginHeader">Inloggen</h1>

      <div class="login">
        <div class="loginContainer">
          <input type="text" name="school" list="schools" v-model="credentials.schoolname"
          placeholder="Schoolnaam" :class="{ error: state.errors.invalidSchoolname }"
          :disabled="state.busy || (guestMode && credentials.schoolname !== '')" v-on:keyup="getSchools()">

          <datalist id="schools">
            <option v-for="(school, index) in schoolQuery"
              :value="school.name" :key="index"></option>
          </datalist>

          <input type="text" name="username" v-model="credentials.username"
          placeholder="Gebruikersnaam" :class="{ error: state.errors.invalidUsername }"
          :disabled="state.busy">
          <input type="password" name="password" v-model="credentials.password"
          placeholder="Wachtwoord" :class="{ error: state.errors.invalidPassword }"
          :disabled="state.busy">

          <div class="checkContainer no-select" v-show="!guestMode">
            <input v-model="saveCredentials" name="saveCreds" type="checkbox" :disabled="state.busy">
            <span>Onthoud mij</span>
          </div>

          <button id="btnSubmit" v-on:click="login()" :disabled="!isFormFilled || state.busy">
            Log in<i class="fas fa-chevron-right"></i>
          </button>

          <div class="guestContainer no-select">
            <p class="detail guestLabel" v-if="guestMode">
              De gastmodus is ingeschakeld waardoor je inloggegevens niet worden opgeslagen.
            </p>
          </div>

          <div v-if="state.busy" class="spinner">
            <i class="fas fa-circle-notch spin"></i>
            <p class="detail no-select">Bezig met aanmelden...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  const { default: magister, getSchools } = require('magister.js')
  const fs = require('fs')
  const request = require('request')

  export default {
    name: 'login-section',
    data: function () {
      return {
        credentials: {
          schoolname: '',
          username: '',
          password: '',
          token: ''
        },
        guestMode: false,
        saveCredentials: true,
        schoolQuery: [],
        state: {
          busy: true,
          errors: {
            invalidSchoolname: false,
            invalidUsername: false,
            invalidPassword: false
          }
        }
      }
    },
    computed: {
      isFormFilled () {
        return (this.credentials.schoolname.length > 0 &&
          this.credentials.username.length > 0 &&
          this.credentials.password.length > 0)
      }
    },
    methods: {
      submit (event) {
        if (event.keyCode === 13 && this.isFormFilled && !this.state.busy) {
          this.login()
        }
      },
      getSchools (callback = undefined) {
        if (this.credentials.schoolname.length > 2) {
          getSchools(this.credentials.schoolname).then((schools) => {
            this.schoolQuery = schools

            if (callback) {
              callback(schools)
            }
          })
        }
      },
      login () {
        // Say that we are busy
        this.state.busy = true

        // Retrieve the school
        this.getSchools((schools) => {
          // Check if there is a school
          if (schools.length === 0) {
            this.state.errors.invalidSchoolname = true
            // We are done so reflect that in the state
            this.state.busy = false
            // Send a notification
            this.$parent.notify('We konden je school niet vinden.', 'error', 5)
          } else {
            // Let the user now the school name is correct
            this.state.errors.invalidSchoolname = false

            // Continue to authentication
            request('https://raw.githubusercontent.com/simplyGits/magisterjs-authcode/master/code.json', { json: true }, (err, res, code) => {
              // Our authentication parameters
              var authenticationParameters = {
                school: schools[0],
                username: this.credentials.username,
                password: this.credentials.password
              }

              // If we were able to fetch the authCode use it
              if (!err && res.statusCode === 200) {
                authenticationParameters.authCode = code
              }

              // Attempt to authenticate
              magister(authenticationParameters)
                .then((m) => {
                  this.state.errors.invalidPassword = false
                  this.state.errors.invalidUsername = false
                  // Set the magister instance in the main app
                  this.$parent.magister = m

                  // Get the token
                  this.credentials.token = m.token
                  // Remove the password for security
                  this.credentials.password = ''

                  if (this.saveCredentials) {
                    try {
                      fs.writeFileSync(this.$parent.files.credentialsFile, JSON.stringify({
                        schoolname: this.credentials.schoolname,
                        username: this.credentials.username,
                        token: this.credentials.token
                      }))
                    } catch (err) {
                      console.log(`An error occured while saving credentials: ${err.message}`)
                    }
                  } else {
                    try {
                      fs.unlinkSync(this.$parent.files.credentialsFile)
                    } catch (err) {
                      if (!err.code === 'ENOENT') {
                        console.log(`An unkown error occured trying to delete credential file: ${err.message}`)
                      }
                    }
                  }

                  // We are done so reflect that in the state
                  this.state.busy = false
                })
                .catch((err) => {
                  if (err.message === 'Invalid password') {
                    this.state.errors.invalidUsername = false // is correct else we get the 2nd error
                    this.state.errors.invalidPassword = true
                    // Send a notification
                    this.$parent.notify('Je wachtwoord is niet juist.', 'error', 5)
                  } else if (err.message === 'Invalid username') {
                    this.state.errors.invalidUsername = true
                    this.state.errors.invalidPassword = true // Can't have a correct password without a username
                    // Send a notification
                    this.$parent.notify('Je gebruikersnaam is niet jusit.', 'error', 5)
                  }

                  // We are done so reflect that in the state
                  this.state.busy = false
                })
            })
          }
        })
      },
      logout () {
        this.$parent.magister = undefined

        // Clear credentials if needed
        if (!this.saveCredentials) {
          // In guest mode the school name needs to be preserved
          if (!this.guestMode) {
            this.credentials.schoolname = ''
          }
          // Clear the username
          this.credentials.username = ''
        }

        // Clear the token
        this.credentials.token = ''
        // Delete the token from saved credentials
        try {
          // Load the saved credentials
          var savedCredentials = JSON.parse(fs.readFileSync(this.$parent.files.credentialsFile))
          // Delete the token from it
          savedCredentials.token = ''
          // Rewrite the file
          fs.writeFileSync(this.$parent.files.credentialsFile, JSON.stringify(savedCredentials))
        } catch (err) {
          // Handle any errors
          if (err.code !== 'ENOENT') { // The file didn't exist so we didn't need to delete the token
            console.log(`An unkown error occured trying to delete the token from the credentials file: ${err.message}`)
          }
        }
      }
    },
    created () {
      // Should we run in guest mode?
      try {
        // Read the school name
        this.credentials.schoolname = JSON.parse(fs.readFileSync(this.$parent.files.schoolFile)).schoolname
        // Set guest mode to true
        this.guestMode = true
        // Set save credentials to false
        this.saveCredentials = false
      } catch (err) {
        // Handle any errors
        if (err.code === 'ENOENT') {
          console.log(`School file does not exist - running in standard mode.`)
        } else {
          console.log(`An unkown error occured trying to read the school file: ${err.message}`)
          console.log(`Running in standard mode.`)
        }
      }

      // Check if we are not a guest
      if (!this.guestMode) {
        try {
          // Try to load saved credentials
          var savedCredentials = JSON.parse(fs.readFileSync(this.$parent.files.credentialsFile))

          // Set any saved credentials
          this.credentials.schoolname = (savedCredentials.schoolname ? savedCredentials.schoolname : this.credentials.schoolname)
          this.credentials.username = (savedCredentials.username ? savedCredentials.username : this.credentials.username)
          this.credentials.token = (savedCredentials.token ? savedCredentials.token : this.credentials.token)
        } catch (err) {
          // Handle any errors
          if (err.code === 'ENOENT') {
            this.saveCredentials = false // Assume so because else the file would exist
            console.log(`Credentials file does not exist.`)
          } else {
            console.log(`An unkown error occured trying to read the credentials file: ${err.message}`)
          }
        }
      }

      // Check if we have an authentication token
      if (this.credentials.token.length > 0) {
        // Retrieve the school
        this.getSchools((schools) => {
          // Check if there is a school
          if (schools.length === 0) {
            // We are done so reflect that in the state
            this.state.busy = false
          } else {
            // Continue to authentication
            request('https://raw.githubusercontent.com/simplyGits/magisterjs-authcode/master/code.json', { json: true }, (err, res, code) => {
              // Our authentication parameters
              var authenticationParameters = {
                school: schools[0],
                token: this.credentials.token
              }

              // If we were able to fetch the authCode use it
              if (!err && res.statusCode === 200) {
                authenticationParameters.authCode = code
              }

              // Attempt to authenticate
              magister(authenticationParameters)
                .then((m) => {
                  // Set the magister instance in the main app
                  this.$parent.magister = m
                  // We are done so reflect that in the state
                  this.state.busy = false
                })
                .catch((err) => {
                  if (!err.message === 'Cannot read property \'Id\' of undefined') { // This generally means the token was invalid
                    console.log(`An unkown error occured trying to authenticate using previous token: ${err.message}`)
                  }
                  // We are done so reflect that in the state
                  this.state.busy = false
                })
            })
          }
        })
      } else {
        // We are done so reflect that in the state
        this.state.busy = false
      }
    }
  }
</script>

<style>
</style>