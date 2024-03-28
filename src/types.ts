import type OutputModifier from "@/classes/OutputModifier";
import type ModType from "@/enums/ModType";
import type DamageType from "@/enums/DamageType";
import type StatusEffect from "@/enums/StatusEffect";
import type EnumCollection from "./enums/EnumCollection";

export interface PetInterface {
    defensePower: number;
    defenseHealth: number;
}

export interface ModInterface {
    id: string;
    name: string;
    description: string;
    inTooltip: boolean;
    defensePower?: OutputModifier;
    defenseHealth?: OutputModifier;
    defenseRate?: OutputModifier;
    defenseRange?: OutputModifier;
    criticalChance?: OutputModifier;
    criticalDamage?: OutputModifier;
    damageModifier?: OutputModifier;
    elementalAttunement?: DamageType;
    compatibilities?: string[];
    customOptions?: string;
    type?: ModType;
}

export interface ShardInterface {
    id: string;
    name: string;
    description: string;
    icon: string;
    pack: string;
    inTooltip: boolean;
    defensePower?: OutputModifier;
    defenseHealth?: OutputModifier;
    defenseRate?: OutputModifier;
    defenseRange?: OutputModifier;
    criticalChance?: OutputModifier;
    criticalDamage?: OutputModifier;
    damageModifier?: OutputModifier;
    elementalAttunement?: DamageType;
    compatibilities?: string[];
    customOptions?: string;
}

export interface RelicInterface {
    defensePower: number;
    defenseHealth: number;
    godlyStat?: { type: string; value: number };
    mods: string[];
}

export interface AscensionPointInterface {
    id: string;
    label: string;
    maxLevel: number;
    defensePower?: number;
    defenseHealth?: number;
    defenseRate?: number;
    defenseRange?: number;
    getStatForLevel: (stat: string, level: number) => number;
}

// This interface is used to identify all base defense data which will be the same for every user
export interface DefenseRootInterface {
    id: string;
    name: string;
    icon: string;
    mapIcon: string;
    statusEffects: EnumCollection<StatusEffect>;
    damageType: DamageType;
    baseDefensePower: number;
    baseDefenseHealth: number;
    baseAttackRate: number;
    maxAttackRate: number;
    baseRange: number;
    maxRange: number;
    baseAttackRange: number;
    maxAttackRange: number;
    rangeScalar: number;
    ascensionPoints: AscensionPointInterface[];
    attackScalar: number[];
    hpScalar: number[];
    hero: string;
    type: string;
    defenseUnits: number;
    attackAngle: number;
    isUnique: boolean;
}

// This interface is used to identify all base defense data which will be the same for every user
export interface DefenseStatsInterface {
    defenseHitPoints: number;
    attackRate: number;
    attackRatePercentage: number;
    defenseRange: number;
    criticalChance: number;
    criticalDamage: number;
    defensePower: number;
    tooltipAttackDamage: number;
    tooltipDps: number;
    totalDps: number;
    totalAttackDamage: {
        nonCrit: number;
        crit: number;
    };
}

export interface SetupElementalCombosInterface {
    petrify: boolean;
    ignite: boolean;
    electrocute: boolean;
    shatter: boolean;
}

export interface SetupHeroBuffsInterface {
    talisman: boolean;
    talismanChiSupercharge: boolean;
    talismanChiBurst: boolean;
    callToArms: boolean;
    callToArmsInspiredShout: boolean;
    eruption: boolean;
    eruptionTwiceAsBright: boolean;
    radiantPower: number;
    radiantCriticalPower: number;
}

export interface SetupLaneMutatorsInterface {
    armored: boolean;
    berserked: boolean;
    reckless: boolean;
    softSpot: boolean;
    spellbreaker: boolean;
}

export interface SetupEnemyTypesInterface {
    frost: boolean;
}

export interface DefenseSetupModifiersInterface {
    combos: SetupElementalCombosInterface;
    heroBuffs: SetupHeroBuffsInterface;
    laneMutators: SetupLaneMutatorsInterface;
    enemyType: SetupEnemyTypesInterface;
}

// This interface is used to identify user data for defenses which will be different for every user
export interface UserDefenseInterface {
    isCollapsed: boolean;
    isUserDataCollapsed: boolean;
    incrementId: number;
    id: string;
    label: string;
    ascensionPoints: { [id: string]: number };
    pet: PetInterface;
    relic: RelicInterface;
    diverseStack?: number;
    shards: string[];
}

export interface UserSetupDefenseInterface {
    defenseCount: number;
}

export interface UserDefenseSetupInterface {
    label: string;
    incrementId: number;
    modifiers: DefenseSetupModifiersInterface;
    defensesIncrementIds?: number[]; // @deprecated since v1.1.7
    defenses: { [defensesIncrementId: number]: UserSetupDefenseInterface };
}

export interface CalculatedDefenseStatsInterface {
    totalDps: number;
    critChance: number;
    critDamage: number;
    defenseHealth: number;
    defensePower: number;
}

export interface DefenseStatInterface<TVal>{
    label: string;
    value: TVal;
    attackDamage?: number;
    critDamage?: number;
    dps?: number;
    template?: string;
}

export interface MapDefenseInterface {
    id: string;
    incrementId: number;
    label: string;
    shards: string[];
    relic: {
        mods: string[];
        godlyStat: {
            type: string;
            value: number;
        };
    },
}

export interface MapDefensePlacementInterface {
    incrementId: number
    defenseIncrementId: number
    rotationInDegrees: number
    position: {
        x: number,
        y: number,
    }
}

export interface MapAuthor {
    id: string;
    name: string;
}

export interface MapConfigInterface {
    id?: string;
    title: string;
    map: string;
    gameMode: string;
    difficulty: string|null;
    description: string;
    thumbnail?: string;
    userVote: string|null;
    author: MapAuthor;
    votes: {
        up: number,
        down: number,
    };
    tags: string[];
    defenses: MapDefenseInterface[];
    mapLayout: MapDefensePlacementInterface[];
    createdAt: Date;
}
