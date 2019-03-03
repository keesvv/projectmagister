<!-- TODO: reduce #getAppointments() calls, possibly by watching for changes in $parent.cache.appointments with a delay -->
<template>
  <div class="card" id="agenda">
    <h1>Agenda <span v-show="this.$parent.cache.appointments.length != 0">voor {{ formatDateTime(targetDate, 'dddd') }}</span></h1>
    <div :class="{ bigList: getAppointments(targetDate).length > 0 }">
      <div class="cardLoading" v-if="!$parent.state.cached.appointments">
        <i class="fas fa-circle-notch spin"></i>
      </div>

      <div v-if="getAppointments(targetDate).length === 0 && $parent.state.cached.appointments" class="no-info">
        <i class="far fa-calendar"></i>
        <p>Geen afspraken voor {{ formatDateTime(targetDate, 'dddd') }}.</p>
      </div>

      <div v-for="appointment in getAppointments(targetDate)" class="bigListItem" :class="{ scrapped: appointment.isCancelled }" @click="showAppointmentInfo(appointment)">
        <div class="itemContainer calendarItem">{{ appointment.startBySchoolhour }}</div>
        <div v-if="appointment.startBySchoolhour != appointment.endBySchoolhour" class="itemContainer calendarItem">{{ appointment.endBySchoolhour }}</div>
        <div class="itemDesc">
          <p>
            {{ appointment.description }}
            <span> {{ formatDateTime(appointment.start) }} - {{ formatDateTime(appointment.end) }} </span>
            <span class="location" v-if="appointment.location">{{ appointment.location }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  const moment = require('moment')

  export default {
    computed: {
      targetDate () {
        var now = moment()
        var target = moment()

        // Get today's appointments
        var todaysAppointments = this.getAppointments()
        // Check if there were any appointments
        if (todaysAppointments.length > 0) {
          // Fetch today's last appointment
          var lastAppointment = todaysAppointments[todaysAppointments.length - 1]
          // Check if the last appointment is over
          if (now.isSameOrAfter(lastAppointment.end)) {
            target.add(1, 'days') // Tomorrow
          }
        } else {
          target.add(1, 'days') // Tomorrow
        }

        // Check if the target is on the weekends
        if (target.day() === 6) {
          target.day(7 + 1) // Next week Monday
        } else if (target.day() === 0) {
          target.day(1) // This week monday (because some fuckers think a week starts on Sunday)
        }

        return target
      }
    },
    methods: {
      getAppointments (from = moment(), to = moment(from)) {
        from.startOf('day')
        to.endOf('day')

        return this.$parent.cache.appointments.filter((appointment) => {
          return (from.isSameOrBefore(appointment.start) && to.isSameOrAfter(appointment.start))
        })
      },
      formatDateTime (date, format = 'H:mm') {
        return moment(date).format(format)
      }
    }
  }
</script>

<style lang="scss" scoped>
</style>
