import DamageType from "@/enums/DamageType";

import type StatusEffect from "@/enums/StatusEffect";
import type { ModInterface } from "@/types";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";

export default function useDefenseDamageType(): any {
    return {
        getDamageType(defense: UserDataStoreDefenseInterface): DamageType {
            if (!defense.defenseData) {
                return DamageType.NonLethal;
            }

            if (!defense.defenseData.damageType.canBeAttuned()) {
                return defense.defenseData.damageType;
            }

            const elementalAttunementMods: ModInterface[] = defense.userMods.filter((mod: ModInterface) => mod.elementalAttunement !== undefined);
            if (elementalAttunementMods.length === 0) {
                return defense.defenseData.damageType;
            }

            return elementalAttunementMods[0].elementalAttunement as DamageType;
        },

        getStatusEffect(defense: UserDataStoreDefenseInterface): StatusEffect[] {
            if (!defense.defenseData) {
                return [];
            }

            if (defense.defenseData.statusEffects.length > 0) {
                return defense.defenseData.statusEffects;
            }

           return this.getDamageType(defense).getRelatedStatusEffects();
        },
    }
}
