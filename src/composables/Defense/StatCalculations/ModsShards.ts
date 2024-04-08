import ModType from "@/enums/ModType";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";
import type { ModInterface, ShardInterface } from "@/types";
import type { CalculationConditionsInterface } from "@/composables/Defense/DefenseCalculations";
import type { OutputModifierMutatorsInterface } from "@/classes/OutputModifier";
import type OutputModifier from '@/classes/OutputModifier';

interface ModsShardsComposable {
    forRegularModsAndShards: (stat: string, callback: (util: ModInterface|ShardInterface, outputModifier: OutputModifier) => void, includePylons?: boolean) => void
    diverseValueForStat: (stat: string, modifierType: string) => number
}

export default function useModsShards(defense: UserDataStoreDefenseInterface, calculationConditions: CalculationConditionsInterface): ModsShardsComposable {
    
    return { 
        forRegularModsAndShards: function(stat: string, callback: (util: ModInterface|ShardInterface, outputModifier: OutputModifier) => void, includePylons: boolean = false): void {
            [...defense.userMods, ...defense.userShards].forEach((util: ModInterface|ShardInterface): void => {
                let statOutputModifiers: OutputModifier[]|OutputModifier|undefined = (util as any)[stat]
                if (!statOutputModifiers) {
                    return
                }

                if ((util as ModInterface).type?.equals(ModType.Diverse)) {
                    return
                }
    
                if (calculationConditions.setupDefenseOptions.value && (util as ModInterface).type?.equals(ModType.Unique)) {
                    if ((calculationConditions.setupDefenseOptions.value[defense.userData.incrementId]?.defenseCount ?? 1) > 1) {
                        return;
                    }
                }

                if (!Array.isArray(statOutputModifiers)) {
                    statOutputModifiers = [statOutputModifiers]
                }

                statOutputModifiers.forEach((statOutputModifier: OutputModifier): void => {
                    const mutators: undefined|OutputModifierMutatorsInterface = statOutputModifier?.mutators
                    if (!includePylons && mutators?.pylon) {
                        return
                    }

                    if (mutators.applyTo) {
                        if (mutators.applyTo === 'Base' && defense.defenseData?.children) {
                            callback(util, statOutputModifier);
                        }

                        if (defense.defenseData?.id === mutators.applyTo) {
                            callback(util, statOutputModifier);
                        }

                        return
                    }
        
                    callback(util, statOutputModifier);
                })
            })
        },

        diverseValueForStat: function (stat: string, modifierType: string): number {
            const defenseIds: string[] = calculationConditions.setupDefenses.value?.map((setupDefense: UserDataStoreDefenseInterface) => setupDefense.userData.id) ?? []
            if (defenseIds.length === 0) {
                return 0
            }

            const uniqueDefenseCount: number = defenseIds.filter((defenseId: string, index: number) => defenseIds.indexOf(defenseId) === index).length
            const diverseStack: number = uniqueDefenseCount > 0 ? uniqueDefenseCount - 1 : (defense.userData.diverseStack ?? 0)
    
            let calculatedDiverseStat = 0
            defense.userMods.forEach((mod: ModInterface): void => {
                if (!mod.type?.equals(ModType.Diverse)) {
                    return
                }
    
                const statModifier = (mod as any)[stat]
                if (!statModifier) {
                    return;
                }
    
                calculatedDiverseStat += (statModifier[modifierType] ?? 0) * diverseStack
            })
    
            return calculatedDiverseStat
        },
     };

}
