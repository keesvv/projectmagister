<template>
  <div class="card" id="berichten">
    <h1>Berichten <span v-if="state.mailbox !== null"><i class="fas fa-arrow-left" @click="state.mailbox = null"></i></span></h1>

    <div>
      <div class="cardLoading" v-if="!$parent.state.cached.messages || state.busy">
        <i class="fas fa-circle-notch spin"></i>
      </div>

      <div v-if="$parent.state.cached.messages && $parent.cache.messageFolders.length === 0" class="no-info">
        <i class="far fa-envelope-open"></i>
        <p>Geen mailboxen gevonden.</p>
      </div>
    </div>

    <div v-if="$parent.state.cached.messages && state.mailbox === null" v-for="i in $parent.cache.messageFolders" class="smallCard" @click="state.mailbox = i.id">
      <div class="itemDesc">
        <p>
          {{ i.name }} 
          <span>({{ i.unreadCount}} ongelezen bericht{{ i.unreadCount === 1 ? '' : 'en' }})</span>
        </p>
      </div>
    </div>

    <div v-for="i in this.messages" class="smallCard">
      <div class="itemContainer messageItem">
        <i v-if="!i.isRead" class="far fa-envelope"></i>
        <i v-if="i.isRead" class="far fa-envelope-open"></i>
      </div>

      <div class="itemDesc">
        <p>
          {{ i.sender.fullName }} -
          <span>{{ i.subject }}</span>
        </p>
        <p>{{ i.summary }}</p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data: function () {
      return {
        messages: [],
        state: {
          busy: false,
          show: {
            read: false
          },
          mailbox: null
        }
      }
    },
    watch: {
      'state.mailbox' () {
        if (this.state.mailbox === null) {
          this.messages = []
        } else {
          var mailbox = this.$parent.cache.messageFolders.filter(mb => mb.id === this.state.mailbox)[0]

          if (mailbox === undefined) {
            this.messages = []
          } else {
            this.messages = mailbox.messages
          }
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
</style>