<template>
  <div id="bigCar" class="dropBox"></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class SmallCar extends Vue {}
</script>

<style scoped lang="scss">
#smallCar {
  top: 0;
  background-color: #9f9;
}
</style>
