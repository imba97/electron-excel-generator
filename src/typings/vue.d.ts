import Vue from 'vue';
import electronStore from 'electron-store';

const type = electronStore.prototype;

declare module 'vue/types/vue' {
  // 3. 声明为 Vue 补充的东西

  interface Vue {
    $eStore: typeof type;
  }

  interface VueConstructor {
    eStore: typeof type;
  }
}
