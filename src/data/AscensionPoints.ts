import type { AscensionPointInterface } from "@/types";

export class DefenseHealthAP implements AscensionPointInterface {
    id: string = "defense_health"
    label: string = "Defense Health"
    maxLevel: number = 0
    defensePower: number = 0
    defenseHealth: number = 0
    defenseHealthMultiplier: number = 20
    defenseRate: number = 0
    defenseRange: number = 0

    constructor(
        defenseHealthMultiplier: number = 15,
        maxLevel: number = 999,
    ) {
        this.defenseHealthMultiplier = defenseHealthMultiplier;
        this.maxLevel = maxLevel;
    }

    getStatForLevel(stat: string, upgradeLevel: number = 0): number {
        if (stat !== 'defenseHealth') {
            return 0
        }

        return upgradeLevel * this.defenseHealthMultiplier;
    }
}

export class DefensePowerAP implements AscensionPointInterface {
    id: string = "defense_power"
    label: string = "Defense Power"
    maxLevel: number = 0
    defensePower: number = 0
    defensePowerMultiplier: number = 20
    defenseHealth: number = 0
    defenseRate: number = 0
    defenseRange: number = 0

    constructor(
        defensePowerMultiplier: number = 20,
        maxLevel: number = 999,
    ) {
        this.defensePowerMultiplier = defensePowerMultiplier;
        this.maxLevel = maxLevel;
    }

    getStatForLevel(stat: string, upgradeLevel: number = 0): number {
        if (stat !== 'defensePower') {
            return 0
        }

        return upgradeLevel * this.defensePowerMultiplier;
    }
}

export class DefenseRangeAP implements AscensionPointInterface {
    id: string = "defense_range"
    label: string = "Defense Range"
    maxLevel: number = 0
    defensePower: number = 0
    defensePowerMultiplier: number = -30
    defenseHealth: number = 0
    defenseRate: number = 0
    defenseRange: number = 0
    defenseRangeMultiplier: number = 0

    constructor(
        defensePowerMultiplier: number = -30,
        defenseRangeMultiplier: number = 30,
        maxLevel: number = 50,
    ) {
        this.defensePowerMultiplier = defensePowerMultiplier;
        this.defenseRangeMultiplier = defenseRangeMultiplier;
        this.maxLevel = maxLevel;
    }

    getStatForLevel(stat: string, upgradeLevel: number = 0): number {
        if (stat === 'defensePower') {
            return upgradeLevel * this.defensePowerMultiplier
        }

        if (stat === 'defenseRange') {
            return upgradeLevel * this.defenseRangeMultiplier
        }

        return 0;
    }
}

export class DefenseRateAP implements AscensionPointInterface {
    id: string = "defense_rate"
    label: string = "Defense Rate";
    maxLevel: number = 0;
    defensePower: number = 0;
    defenseHealth: number = 0;
    defenseRate: number = 0;
    defenseRatePercentage: number = 1.75;
    defenseRange: number = 0

    constructor(
        defenseRatePercentage: number = 1.75,
        maxLevel: number = 20,
    ) {
        this.defenseRatePercentage = defenseRatePercentage;
        this.maxLevel = maxLevel;
    }

    getStatForLevel(stat: string, upgradeLevel: number = 0): number {
        if (stat !== 'defenseRate') {
            return 0
        }

        return upgradeLevel * this.defenseRatePercentage;
    }
}
