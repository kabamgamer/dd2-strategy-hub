import { computed } from 'vue';

import type { ComputedRef } from 'vue';
import type { UserDataStoreDefenseInterface } from '@/stores/UserData';
import type { CalculationConditionsInterface } from '@/composables/Defense/DefenseCalculations';
import type { ModInterface, ShardInterface } from '@/types';
import type OutputModifier from '@/classes/OutputModifier';
import useAncientPowers from '@/composables/Defense/AncientPowers';
import usePylonCalculations from '@/composables/Defense/PylonCalculations';
import useModsShards from '@/composables/Defense/StatCalculations/ModsShards';

interface DefenseHealthCalculationsComposable {
    defenseHealth: ComputedRef<number>
    defenseHealthAdditives: ComputedRef<number>
    defenseHealthMultiplier: ComputedRef<number>
    vampiricHealth: ComputedRef<number>
}

export default function useDefenseHealthCalculations(
    defense: UserDataStoreDefenseInterface,
    calculationConditions: CalculationConditionsInterface,
): DefenseHealthCalculationsComposable {

    const { ancientFortificationMultiplier } = useAncientPowers()
    const { forRegularModsAndShards } = useModsShards(defense, calculationConditions)

    const defenseHealthAdditives = computed<number>((): number => {
        let additiveValues = 0

        if (!defense.defenseData) {
            return 0
        }

        additiveValues += defense.ascensionDefenseHealth;

        forRegularModsAndShards('defenseHealth', (util: ModInterface|ShardInterface, defenseHealthModifier: OutputModifier): void => {
            additiveValues += defenseHealthModifier.additive ?? 0
        })

        return additiveValues
    })

    const defenseHealthMultiplier = computed<number>((): number => {
        let multiplier = 1

        if (!defense.defenseData) {
            return 1
        }

        forRegularModsAndShards('defenseHealth', (util: ModInterface|ShardInterface, defenseHealthModifier: OutputModifier): void => {
            if (!defenseHealthModifier.percentage) {
                return;
            }
            
            multiplier += defenseHealthModifier.percentage / 100
        })

        multiplier *= 1 + usePylonCalculations(defense, calculationConditions.setupDefenses).pylonsModifier('defenseHealth') / 100

        return multiplier
    })

    const defenseHealth = computed<number>((): number => {
        if (!defense.defenseData?.baseDefenseHealth) {
            return 0
        }

        let totalDefenseHealth: number = defense.userData.pet.defenseHealth + defense.userData.relic.defenseHealth + defense.defenseData.baseDefenseHealth;

        totalDefenseHealth *= ancientFortificationMultiplier.value
        totalDefenseHealth += defenseHealthAdditives.value
        totalDefenseHealth *= defenseHealthMultiplier.value

        return totalDefenseHealth
    })

    const vampiricHealth = computed<number>((): number => {
        if (!defense.defenseData) {
            return 0
        }

        let vampiricHealthStat: number
        if (defense.defenseData.id === 'BuffBeam') {
            vampiricHealthStat = defense.userData.relic.defenseHealth
        } else {
            vampiricHealthStat = (defense.userData.pet.defenseHealth + defense.defenseData.baseDefenseHealth + defense.userData.relic.defenseHealth) * ancientFortificationMultiplier.value + defense.ascensionDefenseHealth
            forRegularModsAndShards('defenseHealth', (util: ModInterface|ShardInterface, defenseHealthModifier: OutputModifier): void => {
                vampiricHealthStat += defenseHealthModifier.additive ?? 0
            })
        }

        const powerTransferShard: ShardInterface|undefined = defense.userShards.find((shard: ShardInterface) => shard.id === 'power_transfer')
        vampiricHealthStat *= (1 + ((powerTransferShard?.defenseHealth?.percentage ?? 0) / 100))

        if (calculationConditions.defenseLevel.value === 1) {
            return vampiricHealthStat
        }

        const vampUpgradeStat: number = defense.userData.pet.defenseHealth * ancientFortificationMultiplier.value + defense.defenseData.baseDefenseHealth + defense.userData.relic.defenseHealth
        const currentHealthScalar: number = defense.defenseData.hpScalar[calculationConditions.defenseLevel.value-1]
        const tier1HealthScalar: number = defense.defenseData.hpScalar[0]

        vampiricHealthStat += vampUpgradeStat * (currentHealthScalar / tier1HealthScalar - 1)

        return vampiricHealthStat
    })

    return { defenseHealth, defenseHealthAdditives, defenseHealthMultiplier, vampiricHealth }
}
