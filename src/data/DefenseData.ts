import HasAscensionPoints from "@/traits/HasAscensionPoints";
import type { AscensionPointInterface, DefenseRootInterface } from "@/interaces";
import { DefenseHealthAP, DefensePowerAP, DefenseRangeAP, DefenseRateAP } from "@/data/AscensionPoints";

export interface DefenseDataResponse {
    defense: string;
    hero: string;
    iconUrl: string;
    baseDefPwr: number;
    baseDefHealth: number;
    baseAtkRate: number;
    maxAtkRate: number;
    baseAtkRange: number;
    maxAtkRange: number;
    rangeScalar: number;
    t1AtkScalar: number;
    t2AtkScalar: number;
    t3AtkScalar: number;
    t4AtkScalar: number;
    t5AtkScalar: number;
    t1HpScalar: number;
    t2HpScalar: number;
    t3HpScalar: number;
    t4HpScalar: number;
    t5HpScalar: number;
    ascDefPwr: number;
    ascDefHp: number;
    ascGambit: number;
}

export default class DefenseData extends HasAscensionPoints implements DefenseRootInterface {
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
    attackScalar: number[];
    hpScalar: number[];
    ascensionPoints: AscensionPointInterface[];

    constructor(data: DefenseDataResponse) {
        super();

        this.populate(data);
    }

    /**
     * @param data
     * @protected
     */
    protected populate(data: DefenseDataResponse): void {
        // Very basic check to see if data is present
        if (!data.maxAtkRange || !data.baseDefPwr) {
            return
        }

        this.id = data.defense.replace(/\s/g, '');
        this.name = data.defense;
        this.icon = data.iconUrl;
        this.baseDefensePower = data.baseDefPwr;
        this.baseDefenseHealth = data.baseDefHealth;
        this.baseAttackRate = data.baseAtkRate;
        this.maxAttackRate = data.maxAtkRate;
        this.baseAttackRange = data.baseAtkRange;
        this.maxAttackRange = data.maxAtkRange;
        this.rangeScalar = data.rangeScalar;
        this.attackScalar = [
            data.t1AtkScalar,
            data.t2AtkScalar,
            data.t3AtkScalar,
            data.t4AtkScalar,
            data.t5AtkScalar,
        ];
        this.hpScalar = [
            data.t1HpScalar,
            data.t2HpScalar,
            data.t3HpScalar,
            data.t4HpScalar,
            data.t5HpScalar,
        ];
        this.ascensionPoints = [
            new DefensePowerAP(data.ascDefPwr),
            new DefenseHealthAP(data.ascDefHp),
            new DefenseRangeAP(data.ascGambit),
            new DefenseRateAP,
        ];
    }
}
