import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import DefenseCalculators from '@/views/calculator/DefenseCalculators.vue'

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home
    },
    {
        path: '/calculator/defense',
        name: 'calculator.defense',
        component: DefenseCalculators
    },
]

const router = createRouter({ history: createWebHistory(), routes })
export default router
