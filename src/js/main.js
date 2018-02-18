// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
// using component library for expectable behavior
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-default/index.css';
import 'element-ui/lib/theme-default/fonts/element-icons.ttf';
import 'element-ui/lib/theme-default/fonts/element-icons.woff';
// override default locale with english
import locale from 'element-ui/lib/locale/lang/en';
// import our root component and our router object
import App from './App';
import router from './router';

Vue.use(ElementUI, { locale });

Vue.config.productionTip = false;

// initialize Vue and load root component
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: {
    App,
  },
});
