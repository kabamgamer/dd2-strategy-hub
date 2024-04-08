import DamageType from "@/enums/DamageType";
import ModType from "@/enums/ModType";
import HasOutputModifier from "@/traits/HasOutputModifier";

import type { ModInterface } from "@/types";
import type OutputModifier from "@/classes/OutputModifier";

export interface DefenseModDataResponse {
    id: string;
    name: string;
    description: string;
    inTooltip: boolean;
    type?: string;
    defensePowerModifier?: string;
    defenseHealthModifier?: string;
    defenseRateModifier?: string;
    defenseRangeModifier?: string;
    criticalChanceModifier?: string;
    criticalDamageModifier?: string;
    damageModifier?: string;
    elementalAttunement?: string;
    compatibilities?: string;
    customOptions?: string;
}

export default class DefenseModData extends HasOutputModifier implements ModInterface {
    id: string = '';
    name: string = '';
    description: string = '';
    inTooltip: boolean = true;
    defensePower?: OutputModifier;
    defenseHealth?: OutputModifier;
    defenseRate?: OutputModifier;
    defenseRange?: OutputModifier;
    criticalChance?: OutputModifier;
    criticalDamage?: OutputModifier;
    damageModifier?: OutputModifier|OutputModifier[];
    elementalAttunement?: DamageType;
    compatibilities?: string[] = undefined;
    customOptions?: string;
    type?: ModType;

    constructor(data: DefenseModDataResponse) {
        super()

        this.populate(data)
    }

    /**
     * @param data
     * @protected
     */
    protected populate(data: DefenseModDataResponse): void {
        // Very basic check to see if data is present
        if (data.id === '' || data.name === '') {
            return
        }

        this.id = data.id
        this.name = data.name
        this.description = data.description
        this.inTooltip = data.inTooltip
        this.type = ModType.createEnum(data.type?.toLowerCase())
        this.defensePower = this.getOutputModifierForValue(data.defensePowerModifier) as OutputModifier|undefined
        this.defenseHealth = this.getOutputModifierForValue(data.defenseHealthModifier) as OutputModifier|undefined
        this.defenseRate = this.getOutputModifierForValue(data.defenseRateModifier) as OutputModifier|undefined
        this.defenseRange = this.getOutputModifierForValue(data.defenseRangeModifier) as OutputModifier|undefined
        this.criticalChance = this.getOutputModifierForValue(data.criticalChanceModifier) as OutputModifier|undefined
        this.criticalDamage = this.getOutputModifierForValue(data.criticalDamageModifier) as OutputModifier|undefined
        this.damageModifier = this.getOutputModifierForValue(data.damageModifier);
        this.elementalAttunement = DamageType.createEnum(data.elementalAttunement)
        this.customOptions = data.customOptions;

        if (data.compatibilities !== undefined) {
            this.compatibilities = data.compatibilities.split(',')
        }
    }
}
