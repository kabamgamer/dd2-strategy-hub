import { watch } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import DefenseCalculators from '@/views/calculator/DefenseCalculators.vue'
import CommunityMapsOverview from '@/views/community-maps/CommunityMapsOverview.vue'
import CommunityMapsDetail from '@/views/community-maps/CommunityMapsDetail.vue'
import UserDefenses from "@/views/user/UserDefenses.vue";
import { useMetaData } from '@/composables/SEO/metaData'

import type { RouteRecordRaw } from 'vue-router'

import type { MetaDataComposable } from '@/composables/SEO/metaData'

const defaultMetaDataOptions = {
    titleSuffix: ' | Dungeon Defenders 2 Strategy Hub',
}
const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'home',
        component: Home,
        meta: {
            metaInfo: useMetaData({
                title: 'Home',
                description: 'Dungeon Defenders 2 Strategy Hub is a place for new and experienced players to make theory crafts, find guides, builds, and more!',
                keywords: ['dungeon defenders 2', 'dd2', 'strategy', 'hub', 'guides']
            }, defaultMetaDataOptions)
        }
    },
    {
        path: '/calculator/defense',
        name: 'calculator.defense',
        component: DefenseCalculators,
        meta: {
            metaInfo: useMetaData({
                title: 'Defense Calculators',
                description: 'On Dungeon Defenders 2 Strategy Hub you can theory craft and calculate your defense setups to get the best out of your builds! Combine all different mods/shards to find the best option for you.',
                keywords: ['mods', 'shards', 'defense calculator', 'dps calculator', 'theory craft', 'defense setup', 'defense builds', 'defense planner', 'defense builder']
            }, defaultMetaDataOptions)
        }
    },
    {
        path: '/community-maps',
        name: 'community-maps',
        component: CommunityMapsOverview,
        meta: {
            metaInfo: useMetaData({
                title: 'Map Builds',
                description: 'On Dungeon Defenders 2 Strategy Hub you can find builds shared by the community or share your own. Let\'s build together!',
                keywords: ['map planner', 'map builds']
            }, defaultMetaDataOptions)
        }
    },
    {
        path: '/community-maps/:id',
        name: 'community-maps.detail',
        component: CommunityMapsDetail,
        meta: {
            metaInfo: useMetaData({
                title: 'Map',
            }, defaultMetaDataOptions)
        }
    },
    {
        path: '/user/defenses',
        name: 'user.defenses',
        component: UserDefenses
    },
]

const router = createRouter({ history: createWebHistory(), routes })

let unwatch: null|(() => void) = null
router.beforeEach((to, from, next) => {
    (from.meta.metaInfo as undefined|MetaDataComposable)?.resetDefaultMeta()

    const seoMetaInfo: undefined|MetaDataComposable = to.meta.metaInfo as undefined|MetaDataComposable
    if (seoMetaInfo) {
        if (unwatch) {
            unwatch()
        }

        // Set meta in head
        seoMetaInfo.writeMetaDataToDocumentHead()
        unwatch = watch(seoMetaInfo.meta, seoMetaInfo.writeMetaDataToDocumentHead)
    }

    next()
})

export default router
