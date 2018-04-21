<template>
  <div id="app">
    <p>aaaa</p>
    <router-link tag="span" :to="{ path: '/a' }">a</router-link>
    <router-link tag="span" :to="{ path: '/b' }">b</router-link>
    <router-link tag="span" :to="{ path: '/c' }">c</router-link>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
};
</script>
