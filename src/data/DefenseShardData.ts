import type { ShardInterface } from "@/interaces";
import type OutputModifier from "@/classes/OutputModifier";
import HasOutputModifier from "@/traits/HasOutputModifier";

export interface DefenseShardDataResponse {
    id: string;
    name: string;
    description: string;
    icon: string;
    pack: string;
    inTooltip: boolean;
    defensePowerModifier?: string;
    defenseHealthModifier?: string;
    defenseRateModifier?: string;
    defenseRangeModifier?: string;
    criticalChanceModifier?: string;
    criticalDamageModifier?: string;
}

export default class DefenseShardData extends HasOutputModifier implements ShardInterface {
    id: string = '';
    name: string = '';
    description: string = '';
    icon: string = '';
    pack: string = '';
    inTooltip: boolean = true;
    defensePower?: OutputModifier;
    defenseHealth?: OutputModifier;
    defenseRate?: OutputModifier;
    defenseRange?: OutputModifier;
    criticalChance?: OutputModifier;
    criticalDamage?: OutputModifier;
    compatibilities?: string[] = undefined;

    constructor(data: DefenseShardDataResponse) {
        super()

        this.populate(data)
    }

    /**
     * @param data
     * @protected
     */
    protected populate(data: DefenseShardDataResponse): void {
        // Very basic check to see if data is present
        if (data.id === '' || data.name === '' || data.pack === '') {
            return
        }

        this.id = data.id
        this.name = data.name
        this.description = data.description
        this.icon = data.icon
        this.pack = data.pack
        this.inTooltip = data.inTooltip
        this.defensePower = this.getOutputModifierForValue(data.defensePowerModifier)
        this.defenseHealth = this.getOutputModifierForValue(data.defenseHealthModifier)
        this.defenseRate = this.getOutputModifierForValue(data.defenseRateModifier)
        this.defenseRange = this.getOutputModifierForValue(data.defenseRangeModifier)
        this.criticalChance = this.getOutputModifierForValue(data.criticalChanceModifier)
        this.criticalDamage = this.getOutputModifierForValue(data.criticalDamageModifier)
    }
}
