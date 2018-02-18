import Vue from 'vue';
import Router from 'vue-router';
// import our two components for the list and detail views
import GameList from '../components/GameList';
import GameDetail from '../components/GameDetail';

// vue-router is used to handle switching between views
Vue.use(Router);

// load both views into Router object. Detail view has dynamic route switching
export default new Router({
  routes: [
  {
    path: '/',
    name: 'game_list',
    component: GameList,
  },
  {
    path: '/:gameID/detail',
    name: 'game_detail',
    component: GameDetail,
    props: true
  },
  ],
});
