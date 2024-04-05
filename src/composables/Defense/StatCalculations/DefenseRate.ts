import { computed } from 'vue';

import type { ComputedRef } from 'vue';
import type { UserDataStoreDefenseInterface } from '@/stores/UserData';
import type { CalculationConditionsInterface } from '@/composables/Defense/DefenseCalculations';
import type { ModInterface, ShardInterface } from '@/types';
import usePylonCalculations from '@/composables/Defense/PylonCalculations';
import useModsShards from '@/composables/Defense/StatCalculations/ModsShards';
import OutputModifier from '@/classes/OutputModifier';

interface DefenseRateCalculationsComposable {
    attackRate: ComputedRef<number>
}

export default function useDefenseRateCalculations(
    defense: UserDataStoreDefenseInterface,
    calculationConditions: CalculationConditionsInterface,
): DefenseRateCalculationsComposable {
    const { forRegularModsAndShards } = useModsShards(defense, calculationConditions)
    
    const attackRate = computed<number>((): number => {
        if (!defense.defenseData?.baseAttackRate) {
            return 0
        }

        let attackRatePercentage: number = 0;
        
        forRegularModsAndShards('defenseRate', (util: ModInterface | ShardInterface, defenseRateModifier: OutputModifier) => {
            attackRatePercentage += defenseRateModifier.percentage ?? 0
        })
        
        attackRatePercentage += defense.ascensionRate;
        attackRatePercentage += usePylonCalculations(defense, calculationConditions.setupDefenses).pylonsModifier('defenseRate');

        const attackRateMultiplier: number = 1 - attackRatePercentage / 100

        const calculatedAttackRate: number = defense.defenseData.baseAttackRate * attackRateMultiplier;

        return calculatedAttackRate < defense.defenseData.maxAttackRate ? defense.defenseData.maxAttackRate : calculatedAttackRate
    })

    return { attackRate }
}
