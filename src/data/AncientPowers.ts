export interface UserAncientResetPoints {
    [key: string]: number;
}

export class AncientAbilityPower {
    id: string = "ancient_ability_power"
    name: string = "Ability Power"
    icon: string = "https://wiki.dungeondefenders2.com/images/0/02/Ancient_Ability_Power.png"
    upgradeLevel: number = 0
    static upgrades: number[] = [.04, .06, .08, .09, .1, .12, .14, .16, .18, .20]
}

export class AncientHeroicPower {
    id: string = "ancient_heroic_power"
    name: string = "Heroic Power"
    icon: string = "https://wiki.dungeondefenders2.com/images/c/c4/Ancient_Heroic_Power.png"
    upgradeLevel: number = 0
    static upgrades: number[] = [.04, .06, .08, .09, .1, .12, .14, .16, .18, .20]
}

export class AncientHealth {
    id: string = "ancient_health"
    name: string = "Health"
    icon: string = "https://wiki.dungeondefenders2.com/images/c/cc/Ancient_Health.png"
    upgradeLevel: number = 0
    static upgrades: number[] = [.04, .06, .08, .09, .1, .12, .14, .16, .18, .20]
}

export class AncientResistance {
    id: string = "ancient_resistance"
    name: string = "Resistance"
    icon: string = "https://wiki.dungeondefenders2.com/images/7/77/Ancient_Resistance.png"
    upgradeLevel: number = 0
    static upgrades: number[] = [.04, .06, .08, .09, .1, .12, .14, .16, .18, .20]
}

export class AncientLifeSteal {
    id: string = "ancient_life_steal"
    name: string = "Life Steal"
    icon: string = "https://wiki.dungeondefenders2.com/images/6/6c/Ancient_Life_Steal.png"
    upgradeLevel: number = 0
    static upgrades: number[] = [.01, .02, .03, .04, .05, .06, .07, .08, .09, .1]
}

export class AncientFortification {
    id: string = "ancient_fortification"
    name: string = "Fortification"
    icon: string = "https://wiki.dungeondefenders2.com/images/8/81/Ancient_Fortification.png"
    upgradeLevel: number = 0
    static upgrades: number[] = [.04, .06, .08, .09, .1, .12, .14, .16, .18, .20]
}

export class AncientDestruction {
    id: string = "ancient_destruction"
    name: string = "Destruction"
    icon: string = "https://wiki.dungeondefenders2.com/images/7/75/Ancient_Destruction.png"
    upgradeLevel: number = 0
    static upgrades: number[] = [.04, .06, .08, .09, .1, .12, .14, .16, .18, .20]
}

export class AncientStrikes {
    id: string = "ancient_strikes"
    name: string = "Strikes"
    icon: string = "https://wiki.dungeondefenders2.com/images/c/c5/Ancient_Strikes.png"
    upgradeLevel: number = 0
    static upgrades: number[] = [.01, .02, .03, .04, .05, .06, .07, .08, .09, .1]
}

export class AncientBuilder {
    id: string = "ancient_builder"
    name: string = "Builder"
    icon: string = "https://wiki.dungeondefenders2.com/images/a/ac/Ancient_Builder.png"
    upgradeLevel: number = 0
    static upgrades: number[] = [.04, .06, .08, .09, .1, .12, .14, .16, .18, .20]
}

export class AncientRespawn {
    id: string = "ancient_respawn"
    name: string = "Respawn"
    icon: string = "https://wiki.dungeondefenders2.com/images/4/4a/Ancient_Respawn.png"
    upgradeLevel: number = 0
    static upgrades: number[] = [.12, .18, .24, .27, .30, .30, .30, .30, .30, .30]
}

export class AncientDefenseCriticalDamage {
    id: string = "ancient_defense_critical_damage"
    name: string = "Defense Critical Damage"
    icon: string = "https://wiki.dungeondefenders2.com/images/3/3e/Ancient_Defense_Critical_Damage.png"
    upgradeLevel: number = 0
    static upgrades: number[] = [.04, .06, .08, .09, .1, .12, .14, .16, .18, .20]
}

export class AncientDefenseCriticalChance {
    id: string = "ancient_defense_critical_chance"
    name: string = "Defense Critical Chance"
    icon: string = "https://wiki.dungeondefenders2.com/images/1/17/Ancient_Defense_Critical_Chance.png"
    upgradeLevel: number = 0
    static upgrades: number[] = [.01, .02, .03, .04, .05, .06, .07, .08, .09, .1]
}

export class AncientHeroCriticalDamage {
    id: string = "ancient_hero_critical_damage"
    name: string = "Hero Damage"
    icon: string = "https://wiki.dungeondefenders2.com/images/e/ec/Ancient_Hero_Critical_Damage.png"
    upgradeLevel: number = 0
    static upgrades: number[] = [.04, .06, .08, .09, .1, .12, .14, .16, .18, .20]
}

export class AncientHeroCriticalChance {
    id: string = "ancient_hero_critical_chance"
    name: string = "Hero Chance"
    icon: string = "https://wiki.dungeondefenders2.com/images/b/bb/Ancient_Hero_Critical_Chance.png"
    upgradeLevel: number = 0
    static upgrades: number[] = [.01, .02, .03, .04, .05, .06, .07, .08, .09, .1]
}

export default [
    new AncientAbilityPower,
    new AncientHeroicPower,
    new AncientHealth,
    new AncientResistance,
    new AncientLifeSteal,
    new AncientFortification,
    new AncientDestruction,
    new AncientStrikes,
    new AncientBuilder,
    new AncientRespawn,
    new AncientDefenseCriticalDamage,
    new AncientDefenseCriticalChance,
    new AncientHeroCriticalDamage,
    new AncientHeroCriticalChance,
]
