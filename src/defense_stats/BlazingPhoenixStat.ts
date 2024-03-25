import type { ComputedRef } from "vue";
import type { DefenseStatInterface, ShardInterface } from "@/types";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";
import type { CalculationConditionsInterface } from "@/composables/Defense/DefenseCalculations";
import useAncientPowers from '@/composables/Defense/AncientPowers';
import { SetupModifierCalculation } from "@/composables/Defense/StatCalculations/SetupModifiers";
import DamageType from "@/enums/DamageType";

export default class BlazingPhoenixStat implements DefenseStatInterface<string> {
    private readonly blazingPhoenixDamage: number
    private readonly criticalMultiplier: number;
    private readonly calculationConditions: CalculationConditionsInterface;

    constructor(
        defense: UserDataStoreDefenseInterface,
        calculationConditions: CalculationConditionsInterface,
        defensePowerAdditives: ComputedRef<number>,
        criticalMultiplier: ComputedRef<number>,
        shard: ShardInterface,
        modsShardsMultiplier: number,
    ) {
        this.criticalMultiplier = criticalMultiplier.value
        this.calculationConditions = calculationConditions
        this.blazingPhoenixDamage = this.calculateBlazingPhoenixDamage(defense, defensePowerAdditives, shard) * modsShardsMultiplier * this.criticalMultiplier
    }

    get label(): string 
    {
        return "Blazing Phoenix"
    }

    get value(): string
    {
        return Math.round(this.blazingPhoenixDamage).toLocaleString('en-US')
    }

    // Blazing Phoenix can only proc once every 10 seconds, so we divide the damage by 10 to get the damage per second
    get dps(): number
    {
        return this.blazingPhoenixDamage / 10
    }

    private calculateBlazingPhoenixDamage(defense: UserDataStoreDefenseInterface, defensePowerAdditives: ComputedRef<number>, shard: ShardInterface): number {
        const defensePower = defense.userData.pet.defensePower * useAncientPowers().ancientDestructionMultiplier.value + (defense.defenseData?.baseDefensePower ?? 0) + defense.userData.relic.defensePower + defensePowerAdditives.value;
        let blazingPhoenixBaseDamage: number = defensePower * parseFloat(shard.customOptions ?? '0') / 100;

        blazingPhoenixBaseDamage *= SetupModifierCalculation.getSetupBonusMultiplier(this.calculationConditions.setupModifiers, DamageType.Fire)

        return blazingPhoenixBaseDamage
    }
}
