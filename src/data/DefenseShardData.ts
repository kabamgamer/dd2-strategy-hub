import type { ShardInterface } from "@/interaces";
import type OutputModifier from "@/classes/OutputModifier";
import HasOutputModifier from "@/traits/HasOutputModifier";

export interface DefenseShardDataResponse {
    ID: string;
    Name: string;
    Description: string;
    Icon: string;
    Pack: string;
    'Defense Power Modifier'?: string;
    'Defense Health Modifier'?: string;
    'Defense Rate Modifier'?: string;
    'Defense Range Modifier'?: string;
    'Critical Chance Modifier'?: string;
    'Critical Damage Modifier'?: string;
}

export default class DefenseShardData extends HasOutputModifier implements ShardInterface {
    id: string = '';
    name: string = '';
    description: string = '';
    icon: string = '';
    pack: string = '';
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
        if (data['ID'] === '' || data['Name'] === '' || data['Pack'] === '') {
            return
        }

        this.id = data['ID']
        this.name = data['Name']
        this.description = data['Description']
        this.icon = data['Icon']
        this.pack = data['Pack']
        this.defensePower = this.getOutputModifierForValue(data['Defense Power Modifier'])
        this.defenseHealth = this.getOutputModifierForValue(data['Defense Health Modifier'])
        this.defenseRate = this.getOutputModifierForValue(data['Defense Rate Modifier'])
        this.defenseRange = this.getOutputModifierForValue(data['Defense Range Modifier'])
        this.criticalChance = this.getOutputModifierForValue(data['Critical Chance Modifier'])
        this.criticalDamage = this.getOutputModifierForValue(data['Critical Damage Modifier'])
    }


}
