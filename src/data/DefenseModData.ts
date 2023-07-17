import type { ModInterface } from "@/interaces";
import type OutputModifier from "@/classes/OutputModifier";
import ModType from "@/enums/ModType";
import HasOutputModifier from "@/traits/HasOutputModifier";

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
    compatibilities?: string[] = undefined;
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
        this.type = data.type === '' || data.type === undefined ? undefined : ModType[data.type as keyof typeof ModType]
        this.defensePower = this.getOutputModifierForValue(data.defensePowerModifier)
        this.defenseHealth = this.getOutputModifierForValue(data.defenseHealthModifier)
        this.defenseRate = this.getOutputModifierForValue(data.defenseRateModifier)
        this.defenseRange = this.getOutputModifierForValue(data.defenseRangeModifier)
        this.criticalChance = this.getOutputModifierForValue(data.criticalChanceModifier)
        this.criticalDamage = this.getOutputModifierForValue(data.criticalDamageModifier)
    }
}
