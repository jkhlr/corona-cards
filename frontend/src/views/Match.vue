<template>
  <div class="match">
    <Table/>
  </div>
</template>

<script>
import Table from "../components/Table.vue";

export default {
  name: "Match",
  components: {
    Table
  }
};
</script>

<style>
  .match {
    height: 100%
  }
</style>
