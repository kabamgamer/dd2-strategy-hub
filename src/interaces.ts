import type OutputModifier from "@/classes/OutputModifier";
import type ModType from "@/enums/ModType";

export interface PetInterface {
    defensePower: number;
    defenseHealth: number;
}

export interface ModInterface {
    id: string;
    name: string;
    description: string;
    defensePower?: OutputModifier;
    defenseHealth?: OutputModifier;
    defenseRate?: OutputModifier;
    defenseRange?: OutputModifier;
    criticalChance?: OutputModifier;
    criticalDamage?: OutputModifier;
    compatibilities?: string[];
    type?: ModType;
}

export interface ShardInterface {
    id: string;
    name: string;
    description: string;
    icon: string;
    pack: string;
    defensePower?: OutputModifier;
    defenseHealth?: OutputModifier;
    defenseRate?: OutputModifier;
    defenseRange?: OutputModifier;
    criticalChance?: OutputModifier;
    criticalDamage?: OutputModifier;
    compatibilities?: string[];
}

export interface RelicInterface {
    defensePower: number;
    defenseHealth: number;
    mods: string[];
}

export interface AscensionPointInterface {
    id: string;
    label: string;
    upgradeLevel: number;
    maxLevel: number;
    defensePower?: number;
    defenseHealth?: number;
    defenseRate?: number;
    setUpgradeLevel: (level: number) => AscensionPointInterface;
}

// This interface is used to identify all base defense data which will be the same for every user
export interface DefenseRootInterface {
    id: string;
    name: string;
    icon: string;
    baseDefensePower: number;
    baseDefenseHealth: number;
    baseAttackRate: number;
    maxAttackRate: number;
    baseAttackRange: number;
    maxAttackRange: number;
    rangeScalar: number;
    ascensionPoints: AscensionPointInterface[];
    attackScalar: number[];
    hpScalar: number[];
}

// This interface is used to identify user data for defenses which will be different for every user
export interface UserDefenseInterface {
    isCollapsed: boolean;
    incrementId: number;
    id: string;
    label: string;
    ascensionPoints: { [id: string]: number };
    pet: PetInterface;
    relic: RelicInterface;
    diverseStack?: number;
    shards: string[];
}

export interface UserDefenseSetupInterface {
    label: string;
    incrementId: number;
    defensesIncrementIds: number[];
}

export interface CalculatedDefenseStatsInterface {
    totalDps: number;
    critChance: number;
    critDamage: number;
    defenseHealth: number;
    defensePower: number;
}
