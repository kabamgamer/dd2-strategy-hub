import type DamageType from "@/enums/DamageType";
import type StatusEffect from "@/enums/StatusEffect";
import type { DefenseRootInterface, ModInterface } from "@/interaces";

export default function useDefenseDamageType(): any {
    return {
        getDamageType(defense: DefenseRootInterface, userMods: ModInterface[]): DamageType {
            if (!defense.damageType.canBeAttuned()) {
                return defense.damageType;
            }

            const elementalAttunementMods: ModInterface[] = userMods.filter((mod: ModInterface) => mod.elementalAttunement !== undefined);
            if (elementalAttunementMods.length === 0) {
                return defense.damageType;
            }

            return elementalAttunementMods[0].elementalAttunement as DamageType;
        },

        getStatusEffect(defense: DefenseRootInterface, userMods: ModInterface[]): StatusEffect[] {
            if (defense.statusEffects.length > 0) {
                return defense.statusEffects;
            }

           return this.getDamageType(defense, userMods).getRelatedStatusEffects();
        },
    }
}
