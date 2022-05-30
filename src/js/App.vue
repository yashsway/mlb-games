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

<style lang='postcss'>
/* Using CSS grid here, thankfully it's in all modern browsers now. TODO: Flexbox fallback with Modernizr */
/* Kept styles as close to name conventions as possible. Could be incredibly more modular with PostCSS @apply and :root */
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
  /* ESLint giving me trouble here for weird reasons, the following media query format is infact supported by CSSNext */
  @media only screen 
  and (width >= 557px) 
  and (width <= 1024px) 
  and (-webkit-min-device-pixel-ratio: 1) {
    grid-template-columns: 5% auto 5%;
  }
  @media only screen 
  and (width >= 0px) 
  and (width <= 667px) 
  and (-webkit-min-device-pixel-ratio: 2)
  and (orientation: portrait) { 
    grid-template-columns: 1% auto 1%;
  }
}
/* flex fallback */
.no-cssgrid #app {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0% 25%;
  @media only screen 
  and (width >= 667px) 
  and (width <= 1024px) 
  and (-webkit-min-device-pixel-ratio: 1) {
    margin: 0% 15%;
  }
  @media only screen 
  and (width >= 0px) 
  and (width <= 667px) 
  and (-webkit-min-device-pixel-ratio: 2)
  and (orientation: portrait) { 
    margin: 0% 5%;
  }
}
#logo {
  height: 10rem;
  width: auto;
  margin: 2px;
}
.container {
  padding: 1rem 5rem;
  justify-self: stretch;
  @media only screen 
  and (width >= 0px) 
  and (width <= 667px) 
  and (-webkit-min-device-pixel-ratio: 2)
  and (orientation: portrait) { 
    padding: 0.5rem 2rem;
  }
}
/* flex fallback */
.no-cssgrid .container {
  flex: 0 1 auto;
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
