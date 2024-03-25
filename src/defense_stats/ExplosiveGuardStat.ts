import type { DefenseStatInterface } from "@/types";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";
import type { CalculationConditionsInterface } from "@/composables/Defense/DefenseCalculations";
import { SetupModifierCalculation } from "@/composables/Defense/StatCalculations/SetupModifiers";
import DamageType from "@/enums/DamageType";

export default class ExplosiveGuard implements DefenseStatInterface<string> {
    private readonly explosiveGuardPercentage: number
    private readonly defense: UserDataStoreDefenseInterface
    private readonly calculationConditions: CalculationConditionsInterface
    private readonly healthAdditives: number
    private readonly defenseLevel: number
    private readonly customLabel?: string

    constructor(
        explosiveGuardPercentage: number,
        defense: UserDataStoreDefenseInterface,
        calculationConditions: CalculationConditionsInterface,
        healthAdditives: number,
        defenseLevel: number,
        customLabel?: string,
    ) {
        this.explosiveGuardPercentage = explosiveGuardPercentage
        this.defense = defense
        this.calculationConditions = calculationConditions
        this.healthAdditives = healthAdditives
        this.defenseLevel = defenseLevel
        this.customLabel = customLabel
    }

    get label(): string 
    {
        return this.customLabel ?? "Explosive Guard"
    }

    get value(): string
    {
        return Math.round(this.calculateExplosiveGuardExplosionDamage()).toLocaleString('en-US')
    }

    private calculateExplosiveGuardExplosionDamage(): number {
        let healthValue: number = ((this.defense.defenseData?.baseDefenseHealth ?? 0) + this.defense.userData.relic.defenseHealth + this.defense.userData.pet.defenseHealth + this.healthAdditives);

        const currentHeatlhScalar: number = this.defense.defenseData?.hpScalar[this.defenseLevel-1] ?? 1
        const tier1HeatlhScalar: number = this.defense.defenseData?.hpScalar[0] ?? 1
        healthValue += healthValue * (currentHeatlhScalar / tier1HeatlhScalar - 1)
        return healthValue * this.explosiveGuardPercentage / 100 * SetupModifierCalculation.getSetupBonusMultiplier(this.calculationConditions.setupModifiers, DamageType.Physical)
    }
}
