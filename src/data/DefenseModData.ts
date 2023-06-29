import type { ModInterface } from "@/interaces";
import type OutputModifier from "@/classes/OutputModifier";
import ModType from "@/enums/ModType";
import HasOutputModifier from "@/traits/HasOutputModifier";

export interface DefenseModDataResponse {
    ID: string;
    Name: string;
    Description: string;
    Type?: string;
    "Defense Power Modifier"?: string;
    "Defense Health Modifier"?: string;
    "Defense Rate Modifier"?: string;
    "Defense Range Modifier"?: string;
    "Critical Chance Modifier"?: string;
    "Critical Damage Modifier"?: string;
}

export default class DefenseModData extends HasOutputModifier implements ModInterface {
    id: string = '';
    name: string = '';
    description: string = '';
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
        if (data['ID'] === '' || data['Name'] === '') {
            return
        }

        this.id = data['ID']
        this.name = data['Name']
        this.description = data['Description']
        this.type = data['Type'] === '' || data['Type'] === undefined ? undefined : ModType[data['Type'] as keyof typeof ModType]
        this.defensePower = this.getOutputModifierForValue(data['Defense Power Modifier'])
        this.defenseHealth = this.getOutputModifierForValue(data['Defense Health Modifier'])
        this.defenseRate = this.getOutputModifierForValue(data['Defense Rate Modifier'])
        this.defenseRange = this.getOutputModifierForValue(data['Defense Range Modifier'])
        this.criticalChance = this.getOutputModifierForValue(data['Critical Chance Modifier'])
        this.criticalDamage = this.getOutputModifierForValue(data['Critical Damage Modifier'])
    }
}
