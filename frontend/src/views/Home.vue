<template>
  <div class="home">
    <Table/>
  </div>
</template>

<script>
import Table from "../components/Table.vue";

export default {
  name: "Home",
  components: {
    Table
  }
};
</script>

<style>
  .home {
    height: 100%
  }
</style>
