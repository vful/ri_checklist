import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import store from '@/store/index';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/:catchAll(.*)',
    name: '404',
    component: () => import( '../views/404NotFoundView.vue')
  },
  {
    path: '/login',
    name: 'login',
    beforeEnter: (to, from, next) => {
      store.dispatch('isSignedIn')
      .then(() => {
        next('/dashboard');
      })
      .catch(() => {
        next();
      });
    },
    component: () => import( '../views/LoginView.vue')
  },
  {
    path: '/logout',
    name: 'logout',
    beforeEnter: (to, from, next) => {
      store.dispatch('signOut')
      .then(() => {
        next('/');
      })
      .catch(() => {
        next();
      });
    },
    component: () => import( '../views/LoginView.vue')
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    beforeEnter: (to, from, next) => {
      store.dispatch('isSignedIn')
      .then(() => {
        next();
      })
      .catch(() => {
        next('/login');
      });
    },
    component: () => import( '../views/DashboardView.vue')
  },
  {
    path: '/project',
    name: 'project',
    beforeEnter: (to, from, next) => {
      store.dispatch('isSignedIn')
      .then(() => {
        next();
      })
      .catch(() => {
        next('/login');
      });
    },
    component: () => import( '../views/ProjectView.vue')
  },
  {
    path: '/checklist/:id',
    name: 'checklist',
    beforeEnter: (to, from, next) => {
      store.dispatch('isSignedIn')
      .then(() => {
        next();
      })
      .catch(() => {
        next('/login');
      });
    },
    component: () => import( '../views/ChecklistView.vue')
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
