import { computed } from 'vue';

import type { ComputedRef } from 'vue';

import { useUserDataStore } from '@/stores/UserData';
import { AncientDefenseCriticalChance, AncientDefenseCriticalDamage, AncientDestruction, AncientHealth, AncientStrikes } from '@/data/AncientPowers';

interface AncientPowersInterface {
    ancientDestructionMultiplier: ComputedRef<number>
    ancientFortificationMultiplier: ComputedRef<number>
    ancientStrikesRangeMultiplier: ComputedRef<number>
    ancientDefenseCriticalChance: ComputedRef<number>
    ancientDefenseCriticalDamage: ComputedRef<number>
}

export default function useAncientPowers(): AncientPowersInterface {
    const userDataStore = useUserDataStore();

    return {
        ancientDestructionMultiplier: computed<number>((): number => {
            if (userDataStore.ancientPowerPoints.ancient_destruction > 0) {
                return 1 + AncientDestruction.upgrades[userDataStore.ancientPowerPoints.ancient_destruction - 1]
            }

            return 1
        }),

        ancientFortificationMultiplier: computed<number>((): number => {
            if (userDataStore.ancientPowerPoints.ancient_health > 0) {
                return 1 + AncientHealth.upgrades[userDataStore.ancientPowerPoints.ancient_health - 1]
            }

            return 1
        }),

        ancientStrikesRangeMultiplier: computed<number>((): number => {
            if (userDataStore.ancientPowerPoints.ancient_strikes > 0) {
                return 1 + AncientStrikes.upgrades[userDataStore.ancientPowerPoints.ancient_strikes - 1]
            }

            return 1
        }),

        ancientDefenseCriticalChance: computed<number>((): number => {
            if (userDataStore.ancientPowerPoints.ancient_defense_critical_chance > 0) {
                return 100 * AncientDefenseCriticalChance.upgrades[userDataStore.ancientPowerPoints.ancient_defense_critical_chance - 1]
            }

            return 0
        }),

        ancientDefenseCriticalDamage: computed<number>((): number => {
            if (userDataStore.ancientPowerPoints.ancient_defense_critical_damage > 0) {
                return 100 * AncientDefenseCriticalDamage.upgrades[userDataStore.ancientPowerPoints.ancient_defense_critical_damage - 1]
            }

            return 0
        }),
    }
}
