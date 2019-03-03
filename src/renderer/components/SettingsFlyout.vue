<template>
  <transition name="settings">
    <div class="settingsMenu no-select" v-show="$parent.state.show.settings">
      <div class="closeSettings" @click="() => { $parent.state.show.settings = false }">
        <i class="fas fa-times"></i>
      </div>

      <h1 class="username-big">{{ $parent.cache.profile.name }}</h1>
      <h2 class="userDesc">{{ $parent.cache.profile.name }}</h2>
      <p class="btnSignOff" title="Meld je af bij Delta" @click="$parent.logout()">Afmelden</p>
    </div>
  </transition>
</template>

<script>
  export default {

  }
</script>

<style lang="scss" scoped>
.settingsMenu {
  position: fixed;
  top: 0;
  left: 0;
  color: white;
  background: rgb(83, 127, 247);
  width: 100%;
  height: 300px;
  z-index: 200;
  padding: 15px;

  .closeSettings {
    cursor: pointer;
    background: rgb(78, 173, 250);
    border-radius: 50%;
    width: 35px;
    height: 35px;
    position: absolute;
    right: 40px;
    top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;

    i {
      color: white;
      font-weight: bold;
    }
  }

  .btnSignOff {
    $bgColor: rgb(247, 75, 75);

    cursor: pointer;
    display: inline-block;
    color: $bgColor;
    background: white;
    font-weight: bold;
    font-size: 0.9em;
    text-align: center;
    border-radius: 7px;
    padding: 8px 14px;
    transition: background-color 0.5s, color 0.3s;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.158);

    &:hover {
      color: white;
      background: $bgColor;
    }
  }

  .userDesc {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.60);
    font-weight: lighter;
    text-transform: uppercase;
    letter-spacing: 3px;
    margin-top: -25px;
  }
}

.settings-enter-active {
  animation: fadeInDown 0.4s;
}
.settings-leave-active {
  animation: slideOutUp 0.2s;
}

</style>
