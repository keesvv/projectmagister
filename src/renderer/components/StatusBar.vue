<template>
  <div class="status-bar no-select" v-if="$parent.magister">
    <h1 class="title-big">
      <span>Project: </span>Delta
      <i class="btn-refresh fas fa-sync-alt" title="Ververs gegevens"
      :class="{ disabled: $parent.state.busy, spin: $parent.state.busy }"
      v-on:click="$parent.loadCache()"></i>
    </h1>

    <div class="profile-info">
      <div class="update" v-if="$parent.state.update.checking || $parent.state.update.downloading || $parent.state.update.installing">
        <span v-if="$parent.state.update.downloading" title="Delta is een update aan het downloaden.">Downloaden<i>.</i><i>.</i><i>.</i></span>
        <span v-else-if="$parent.state.update.checking" title="Delta is aan het controleren op updates.">Controleren<i>.</i><i>.</i><i>.</i></span>
      </div>
      <h1 class="username">{{ $parent.cache.profile.name }}</h1>
      <img src="../assets/imgs/user.png" title="Instellingen en profiel" @click="() => { $parent.state.show.settings = true }">
    </div>
  </div>
</template>

<script>
  export default {

  }
</script>

<style lang="scss" scoped>
.status-bar {
  text-align: left;

  .title-big {
    font-size: 38px;
    box-sizing: border-box;
    display: inline-block;
    width: 30%;
    min-width: 350px;

    span:first-of-type {
      color: rgb(241, 107, 102);
    }
  }

  h1, .profile-info {
    display: inline-block;
    vertical-align: middle;
  }

  .profile-info {
    text-align: right;
    box-sizing: border-box;
    width: 66%;
    display: inline-block;
    min-width: 400px;

    h1 {
      font-size: 22px;
      font-weight: normal;
    }

    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-left: 15px;
      vertical-align: middle;
      transition: transform 0.3s;
      -webkit-user-drag: none;

      &:hover {
        transform: scale(1.1);
      }
    }

    .update {
      display: inline-block;
      vertical-align: middle;
      animation: glow 1.5s alternate infinite;
      width: 95px;
      height: 20px;
      line-height: 20px;
      margin-right: 20px;
      border-radius: 5px;
      text-align: center;

      span {
        vertical-align: middle;
        margin: auto;
        color: white;
        font-size: 12px;

        i {
          animation: dots 1.4s infinite;
          animation-fill-mode: both;
          font-style: normal;
          font-size: 1.3em;

          &:nth-child(2) {
            animation-delay: 0.2s;
          }

          &:nth-child(3) {
            animation-delay: 0.4s;
          }
        }

        &::after {
          animation: dots 1s infinite;
        }
      }
    }
  }

  .btn-refresh {
    vertical-align: middle;
    transition: transform 0.2s, background-color 0.5s;
    border-radius: 50%;
    padding: 10px;
    margin-left: 10px;
    font-size: 24px;
    color: white;
    background: rgb(31, 130, 243);
    cursor: pointer;

    &.disabled {
      background: rgb(202, 202, 202) !important;
      color: rgb(151, 151, 151) !important;
      transform: none !important;
      cursor: default !important;
    }

    &:hover {
      transform: rotate(180deg);
      background: rgb(0, 183, 255);
    }
  }
}
</style>
