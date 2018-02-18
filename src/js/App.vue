<template>
  <div id="app">
    <div class="container branding">
      <img src="../assets/kg_logo.svg" id="logo">
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',
};
</script>

<style>
/* Using CSS grid here, thankfully it's in all modern browsers now. TODO: Flexbox fallback with Modernizr */
/* Kept styles as close to name conventions as possible. Could be incredibly more modular with PostCSS @apply and :root */
/* PostCSS is still being a little buggy, unsure why. */
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  display: grid;
  grid-template-columns: 15% auto 15%;
  grid-template-rows: 1fr auto 1fr;
  grid-template-areas:
    ". header ."
    ". data ."
    ". footer .";
}
#logo {
  height: 10rem;
  width: auto;
  margin: 2px;
}
.container {
  padding: 1rem 5rem;
  justify-self: stretch;
}
.container.branding {
  grid-area: header;
  align-self: center;
}
/* sub-component classes */
.datepicker_input {
    padding: 10px;
    font-size: 0.8rem;
    cursor: pointer;
}
</style>
