export interface OutputModifierMutatorsInterface {
    pylon?: {
        fromSelf?: boolean;
        types?: string[];
        noStack?: string[];
    };
    fromHealth?: {
        vampiric?: boolean;
        skipAscension?: boolean;
        ancientFortificationBonus?: string[];
    };
    fromPower?: {
        skipAscension?: boolean;
        ancientDestructionBonus?: string[];
    };
    noCrit?: boolean;
    noUpgradeScaling?: boolean;
    customStat?: number;
    asDamageType?: string;
    debuff?: boolean;
}

export default class OutputModifier {
    percentage?: number;
    additive?: number;
    mutators: OutputModifierMutatorsInterface;

    constructor(percentage?: number, additive?: number, mutators?: OutputModifierMutatorsInterface) {
        this.percentage = percentage;
        this.additive = additive;
        this.mutators = mutators ?? {};
    }

    calculate(baseValue: number): number {
        if (this.percentage === undefined) {
            return baseValue + (this.additive ?? 0);
        }

        return baseValue * (1 + this.percentage / 100) + (this.additive ?? 0);
    }
}
