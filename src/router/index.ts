import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import DefenseCalculators from '@/views/calculator/DefenseCalculators.vue'
import CommunityMapsOverview from '@/views/community-maps/CommunityMapsOverview.vue'
import CommunityMapsDetail from '@/views/community-maps/CommunityMapsDetail.vue'

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
    {
        path: '/community-maps',
        name: 'community-maps',
        component: CommunityMapsOverview
    },
    {
        path: '/community-maps/:id',
        name: 'community-maps.detail',
        component: CommunityMapsDetail
    },
]

const router = createRouter({ history: createWebHistory(), routes })
export default router
