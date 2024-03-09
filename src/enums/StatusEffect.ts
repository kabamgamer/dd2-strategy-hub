import EnumDefinition from "@/enums/EnumDefinition";

export default class StatusEffect extends EnumDefinition {
    static Chill: StatusEffect = new this('chill');
    static Cripple: StatusEffect = new this('cripple');
    static Drench: StatusEffect = new this('drench');
    static KnockBack: StatusEffect = new this('knockback');
    static KnockUp: StatusEffect = new this('knockup');
    static Oiled: StatusEffect = new this('oiled');
    static Petrify: StatusEffect = new this('petrify');
    static Poisoned: StatusEffect = new this('poisoned');
    static Polymorph: StatusEffect = new this('polymorph');
    static Slow: StatusEffect = new this('slow');
}
