import Vue from 'vue';
import GameList from '../../../src/js/components/GameList';

describe('Hello.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(GameList);
    const vm = new Constructor().$mount();
    expect(vm.$el.querySelector('.current_date').textContent)
      .to.contain('MLB games');
  });
});
