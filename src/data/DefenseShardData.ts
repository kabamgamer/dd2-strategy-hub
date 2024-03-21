import type { ShardInterface } from "@/types";
import type OutputModifier from "@/classes/OutputModifier";
import HasOutputModifier from "@/traits/HasOutputModifier";
import DamageType from "@/enums/DamageType";

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
    damageModifier?: string;
    elementalAttunement?: string;
    compatibilities?: string;
    customOptions?: string;
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
    damageModifier?: OutputModifier;
    elementalAttunement?: DamageType;
    compatibilities?: string[] = undefined;
    customOptions?: string;

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
        this.damageModifier = this.getOutputModifierForValue(data.damageModifier);
        this.elementalAttunement = DamageType.createEnum(data.elementalAttunement?.toLowerCase())
        this.customOptions = data.customOptions;

        if (data.compatibilities !== undefined) {
            this.compatibilities = data.compatibilities.split(',')
        }
    }
}
