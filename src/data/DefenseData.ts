import HasAscensionPoints from "@/traits/HasAscensionPoints";
import type { AscensionPointInterface, DefenseRootInterface } from "@/interaces";
import { DefenseHealthAP, DefensePowerAP, DefenseRangeAP, DefenseRateAP } from "@/data/AscensionPoints";

export interface DefenseDataResponse {
    Defense: string;
    Hero: string;
    iconURL: string;
    'Base Def Pwr': string;
    'Base Def Health': string;
    'Base ATK Rate': string;
    'Max ATK Rate': string;
    'Base ATK Range': string;
    'Max ATK Range': string;
    'Range Scalar': string;
    'T1 ATK Scalar': string;
    'T2 ATK Scalar': string;
    'T3 ATK Scalar': string;
    'T4 ATK Scalar': string;
    'T5 ATK Scalar': string;
    'T1 HP Scalar': string;
    'Tier 2 HP Scalar': string;
    'Tier 3 HP Scalar': string;
    'Tier 4 HP Scalar': string;
    'Tier 5 HP Scalar': string;
    'ASC Def PWR ': string;
    'ASC Def HP': string;
    'ASC Gambit': string;
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
        if (data['Max ATK Range'] === '' || data['Base Def Pwr'] === '') {
            return
        }

        this.id = data['Defense'].replace(/\s/g, '');
        this.name = data['Defense'];
        this.icon = data['iconURL'];
        this.baseDefensePower = parseFloat(data['Base Def Pwr']);
        this.baseDefenseHealth = parseFloat(data['Base Def Health']);
        this.baseAttackRate = parseFloat(data['Base ATK Rate']);
        this.maxAttackRate = parseFloat(data['Max ATK Rate']);
        this.baseAttackRange = parseFloat(data['Base ATK Range']);
        this.maxAttackRange = parseFloat(data['Max ATK Range']);
        this.rangeScalar = parseFloat(data['Range Scalar']);
        this.attackScalar = [
            parseFloat(data['T1 ATK Scalar']),
            parseFloat(data['T2 ATK Scalar']),
            parseFloat(data['T3 ATK Scalar']),
            parseFloat(data['T4 ATK Scalar']),
            parseFloat(data['T5 ATK Scalar']),
        ];
        this.hpScalar = [
            parseFloat(data['T1 HP Scalar']),
            parseFloat(data['Tier 2 HP Scalar']),
            parseFloat(data['Tier 3 HP Scalar']),
            parseFloat(data['Tier 4 HP Scalar']),
            parseFloat(data['Tier 5 HP Scalar']),
        ];
        this.ascensionPoints = [
            new DefensePowerAP(parseFloat(data['ASC Def PWR '])),
            new DefenseHealthAP(parseFloat(data['ASC Def HP'])),
            new DefenseRangeAP(parseFloat(data['ASC Gambit'])),
            new DefenseRateAP,
        ];
    }
}
