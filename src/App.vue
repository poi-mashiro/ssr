<template>
  <div id="app">
    <p>app.vue</p>
    <router-link :to="{ path: '/a' }">a</router-link>
    <router-link :to="{ path: '/b' }">b</router-link>
    <router-link :to="{ path: '/c' }">c</router-link>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'A'
};
</script>
