<template>
  <div id="smallCar" class="dropBox"></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class SmarllCar extends Vue {}
</script>

<style scoped lang="scss">
#bigCar {
  top: 50%;
  background-color: #99f;
}
</style>
