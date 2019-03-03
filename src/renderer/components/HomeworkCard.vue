<template>
  <div class="card" id="huiswerk">
    <h1>Huiswerk <span>tot volgende week vrijdag</span></h1>
    <div class="checkContainer" v-if="$parent.state.cached.appointments">
      <input v-model="state.show.finished" name="huiswerkDone" type="checkbox">
      <span>Toon voltooide</span>
    </div>
    <div>
      <div class="cardLoading" v-if="!$parent.state.cached.appointments">
        <i class="fas fa-circle-notch spin"></i>
      </div>

      <div v-if="$parent.state.cached.appointments && this.getHomework(state.show.finished).length === 0" class="no-info">
        <i class="far fa-smile-wink"></i>
        <p>Er is geen huiswerk gevonden, of heeft de hond het misschien opgegeten?</p>
      </div>
    </div>

    <div v-for="task in this.getHomework(state.show.finished)" class="smallCard">
      <div class="todo">
        <div class="itemContainer homeworkItem">
          <i class="far fa-bookmark"></i>
        </div>

        <p>{{ task.class }}</p>
        <div v-html="task.description"></div>
      </div>

      <div class="btnPanel">
        <div v-if="!task.finished" class="cardButton finishHomework"
        @click="toggleHomeworkState(task)"
        title="Huiswerk afronden"><i class="far fa-check-circle"></i></div>

        <div v-if="task.finished" class="cardButton finishHomework"
        @click="toggleHomeworkState(task)"
        title="Huiswerk markeren als onafgerond"><i class="far fa-times-circle"></i></div>

        <!-- <div class="cardButton infoDetails"
        @click="showAppointmentInfo(task)"
        title="Meer informatie"><i class="fas fa-info"></i></div> -->
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data: function () {
      return {
        state: {
          show: {
            finished: false
          }
        }
      }
    },
    methods: {
      getHomework (includeFinished = false) {
        return this.$parent.cache.homework.filter((homework) => {
          return homework.finished === includeFinished || homework.finished === false || homework.finished === undefined
        })
      },
      toggleHomeworkState (homework) {
        homework.finished = !homework.finished
        homework._appointment.isDone = homework.finished
        console.log(homework)
        homework._appointment.saveChanges()
      }
    }
  }
</script>

<style lang="scss" scoped>
</style>
