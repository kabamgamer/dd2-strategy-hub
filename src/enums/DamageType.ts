import EnumDefinition from "@/enums/EnumDefinition";
import StatusEffect from "@/enums/StatusEffect";

export default class DamageType extends EnumDefinition {
    static NonLethal: DamageType = new this('n/a');

    // Non-elemental damage types
    static Magical: DamageType = new this('magical');
    static Physical: DamageType = new this('physical');

    // Elemental damage types
    static Earth: DamageType = new this('earth');
    static Fire: DamageType = new this('fire');
    static Frost: DamageType = new this('frost');
    static Poison: DamageType = new this('poison');
    static Storm: DamageType = new this('storm');
    static Water: DamageType = new this('water');

    public canBeAttuned(): boolean {
        return this.equals(DamageType.Physical) || this.equals(DamageType.Magical);
    }

    public getRelatedStatusEffects(): StatusEffect[] {
        if (this.equals(DamageType.Poison)) {
            return [StatusEffect.Poisoned];
        }

        if (this.equals(DamageType.Water)) {
            return [StatusEffect.Drench];
        }

        return [];
    }

    public get label(): string {
        return this.id.charAt(0).toUpperCase() + this.id.slice(1);
    }
}
