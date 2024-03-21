import type { Ref } from "vue";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";
import type { ShardInterface } from "@/types";

export default function usePylonCalculations(
    defense: UserDataStoreDefenseInterface,
    setupDefenses: Ref<undefined|UserDataStoreDefenseInterface[]>,
): { pylonsModifier: (stat: string) => number } {
    function getPylonShardsForStat(stat: string, fromSelf: boolean = false): { [shardId: string]: { defenseIncrementId: number, shard: ShardInterface } } {
        const pylons: { [shardId: string]: { defenseIncrementId: number, shard: ShardInterface } } = {};

        if (!setupDefenses.value) {
            return pylons;
        }

        for (const setupDefense of setupDefenses.value) {
            if (setupDefense.incrementId === defense.userData.incrementId) {
                continue;
            }

            for (const shard of setupDefense.userShards) {
                // @ts-ignore
                const shardStat: OutputModifier|undefined = shard[stat] as OutputModifier|undefined
                const defenseType: string = defense.defenseData?.type ?? ''

                if (!shardStat?.mutators.pylon) {
                    continue;
                }

                if (fromSelf ? !shardStat?.mutators.pylon.fromSelf : shardStat?.mutators.pylon.fromSelf) {
                    continue;
                }

                if ((shardStat?.mutators.pylon.types?.length || 0) > 0 && !(shardStat?.mutators.pylon.types || []).includes(defenseType)) {
                    continue;
                }

                pylons[shard.id] = {defenseIncrementId: setupDefense.incrementId, shard}
            }
        }

        return pylons;
    }

    function filterUnstackablePylons(stat: string, pylons: { [shardId: string]: { defenseIncrementId: number, shard: ShardInterface } }): { [shardId: string]: { defenseIncrementId: number, shard: ShardInterface } } {
        for (const shardId in pylons) {
            const pylonShard: ShardInterface|any = pylons[shardId].shard;
            for (const noStack of pylonShard[stat]?.mutators.pylon.noStack ?? []) {
                if (pylons[noStack]) {
                    delete pylons[shardId]
                    break
                }
            }
        }

        return pylons;
    }

    return { 
        pylonsModifier: (stat: string): number => {
            let pylons = getPylonShardsForStat(stat)
    
            pylons = filterUnstackablePylons(stat, pylons)
    
            let pylonsPercentage: number = 0;
            pylonsPercentage += Object.values(pylons).reduce((accumulator: number, currentValue: any) => accumulator + currentValue.shard[stat].percentage, 0)
    
            return pylonsPercentage
        } 
    }
}
