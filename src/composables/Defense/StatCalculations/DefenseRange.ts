import { computed } from 'vue';

import type { ComputedRef } from 'vue';
import type { UserDataStoreDefenseInterface } from '@/stores/UserData';
import type { CalculationConditionsInterface } from '@/composables/Defense/DefenseCalculations';
import type { ModInterface, ShardInterface } from '@/types';
import useAncientPowers from '@/composables/Defense/AncientPowers';
import usePylonCalculations from '@/composables/Defense/PylonCalculations';
import useModsShards from '@/composables/Defense/StatCalculations/ModsShards';

interface DefenseRangeCalculationsComposable {
    defenseRange: ComputedRef<number>
}

export default function useDefenseRangeCalculations(
    defense: UserDataStoreDefenseInterface,
    calculationConditions: CalculationConditionsInterface,
): DefenseRangeCalculationsComposable {
    const { ancientStrikesRangeMultiplier } = useAncientPowers()
    const { forRegularModsAndShards } = useModsShards(defense, calculationConditions)
    
    const defenseRange = computed<number>((): number => {
        if (!defense.defenseData?.baseRange) {
            return 0
        }

        let totalDefenseRange: number = ancientStrikesRangeMultiplier.value * defense.defenseData.baseRange + defense.ascensionRange;

        let rangeAdditive = defense.userData.relic.godlyStat?.type === 'defense_range' ? defense.userData.relic.godlyStat.value : 0;
        let rangeMultiplier = 1;

        forRegularModsAndShards('defenseRange', (util: ModInterface | ShardInterface) => {
            rangeAdditive += util.defenseRange?.additive ?? 0
            
            if (util.defenseRange?.percentage) {
                rangeMultiplier *= (1 + util.defenseRange.percentage / 100)
            }
        })

        totalDefenseRange += rangeAdditive
        totalDefenseRange *= rangeMultiplier
        totalDefenseRange *= 1 + usePylonCalculations(defense, calculationConditions.setupDefenses).pylonsModifier('defenseRange') / 100

        return Math.round((totalDefenseRange > defense.defenseData.maxRange ? defense.defenseData.maxRange : totalDefenseRange) * defense.defenseData.rangeScalar)
    })

    return { defenseRange }
}
