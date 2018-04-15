import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export function createRouter() {
  return new Router({
    mode: 'history',
    routes: [
      {
        name: 'Home',
        path: '/',
        component: () => import('../components/A.vue')
      },
      { name: 'A', path: '/a', component: () => import('../components/A.vue') },
      { name: 'B', path: '/b', component: () => import('../components/B.vue') },
      { name: 'C', path: '/c', component: () => import('../components/C.vue') }
    ]
  });
}
