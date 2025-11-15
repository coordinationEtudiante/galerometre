<script setup lang="ts">
import { RouterView } from "vue-router";
import FooterBar from "./components/footerBar.vue";
</script>

<template>
  <div class="app">
    <RouterView />
    <FooterBar />
  </div>
</template>

<style scoped lang="scss">
.app {
  background-color: #f5f5f5;
  display: flex;
  min-height: 100%;
  flex-direction: column;
  justify-content: space-between;
}
</style>
