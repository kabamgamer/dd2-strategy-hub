import type { ComputedRef } from "vue";
import type { DefenseStatInterface } from "@/types";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";
import useAncientPowers from '@/composables/Defense/AncientPowers';

export default class BlazingPhoenixStat implements DefenseStatInterface<string> {
    private readonly blazingPhoenixDamage: number

    constructor(
        defense: UserDataStoreDefenseInterface,
        defensePowerAdditives: ComputedRef<number>,
    ) {
        this.blazingPhoenixDamage = this.calculateBlazingPhoenixDamage(defense, defensePowerAdditives)
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

    // 1,033,950
    private calculateBlazingPhoenixDamage(defense: UserDataStoreDefenseInterface, defensePowerAdditives: ComputedRef<number>): number {
        const defensePower = defense.userData.pet.defensePower * useAncientPowers().ancientDestructionMultiplier.value + (defense.defenseData?.baseDefensePower ?? 0) + defense.userData.relic.defensePower + defensePowerAdditives.value;
        return defensePower * 58;
    }
}
