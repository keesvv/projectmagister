<template>
  <div class="card" id="opdrachten">
    <h1>Opdrachten</h1>
    <div>
      <div class="cardLoading" v-if="!$parent.state.cached.assignments">
        <i class="fas fa-circle-notch spin"></i>
      </div>

      <div v-if="$parent.cache.assignments.length == 0 && $parent.state.cached.assignments" class="no-info">
        <i class="fas fa-book"></i>
        <p>Geen openstaande opdrachten.</p>
      </div>
    </div>

    <div v-for="assignment in $parent.cache.assignments" class="smallCard">
      <div class="todo">
        <div class="itemContainer homeworkItem">
          <i class="far fa-edit"></i>
        </div>
        <p>{{ assignment.name }}</p>
        <div v-html="assignment.description"></div>
      </div>

      <div class="btnPanel">
        <div class="cardButton infoDetails" @click="showAssignmentInfo(assignment)" title="Meer informatie">
          <i class="fas fa-info"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {}
</script>

<style lang="scss" scoped>
</style>
