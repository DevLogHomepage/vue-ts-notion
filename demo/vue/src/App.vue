<template>
  <div id="app">
    <router-view :key="$route.params.id"></router-view>
  </div>
</template>

<style>
body {
  margin: 0;
  box-sizing: border-box;
}
</style>
