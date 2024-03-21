import type { DefenseStatInterface } from "@/types";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";

export default class ShieldingGuardStat implements DefenseStatInterface<string> {
    private readonly shieldingGuardPercentage: number
    private readonly defense: UserDataStoreDefenseInterface
    private readonly healthAdditives: number
    private readonly defenseLevel: number
    private readonly customLabel?: string

    constructor(
        shieldingGuardPercentage: number,
        defense: UserDataStoreDefenseInterface,
        healthAdditives: number,
        defenseLevel: number,
        customLabel?: string,
    ) {
        this.shieldingGuardPercentage = shieldingGuardPercentage
        this.defense = defense
        this.healthAdditives = healthAdditives
        this.defenseLevel = defenseLevel
        this.customLabel = customLabel
    }

    get label(): string 
    {
        return this.customLabel ?? "Shielding Guard HP"
    }

    get value(): string
    {
        return Math.round(this.calculateShieldingGuardShieldHP()).toLocaleString('en-US')
    }

    private calculateShieldingGuardShieldHP(): number {
        let healthValue: number = ((this.defense.defenseData?.baseDefenseHealth ?? 0) + this.defense.userData.relic.defenseHealth + this.defense.userData.pet.defenseHealth + this.healthAdditives);

        const currentHeatlhScalar: number = this.defense.defenseData?.hpScalar[this.defenseLevel-1] ?? 1
        const tier1HeatlhScalar: number = this.defense.defenseData?.hpScalar[0] ?? 1
        healthValue += healthValue * (currentHeatlhScalar / tier1HeatlhScalar - 1)
        return healthValue * this.shieldingGuardPercentage / 100
    }
}
