import { ref } from "vue";

import protobotDefenseBuildsData from "@/data/protobotBuildData.json";
import { useDefenseStore } from "@/stores/DefenseInfo";
import { useModStore } from "@/stores/ModInfo";

import type { UserDataStoreDefenseInterface } from "@/stores/UserData";
import type { ModInterface, UserDefenseInterface } from "@/types";

export function useProtobot(): any {
    const protobotDefenses = ref<UserDataStoreDefenseInterface[]>([]);

    const { getDefenseRoot } = useDefenseStore();
    const { getModById } = useModStore();

    loadProtobotDefenses();

    async function loadProtobotDefenses(): Promise<void>
    {
        const _protobotDefenses: UserDefenseInterface[] = await formatProtobotDefenses();
        protobotDefenses.value = await Promise.all(_protobotDefenses.map(async (userData: UserDefenseInterface): Promise<UserDataStoreDefenseInterface> => {
            return {
                incrementId: 1,
                defenseData: await getDefenseRoot(userData.id),
                userData,
                userMods: [],
                userShards: [],
            }
        }));

        return Promise.resolve();
    }

    function getShardId(shardName: string): string|null {
        shardName = shardName.trim();

        if (shardName === '') {
            return null
        }

        const shardId = shardName.replace(/[\s-]/g, '_').toLowerCase().trim();
        return shardId.replace('\'', '')
    }

    async function formatProtobotDefenses(): Promise<UserDefenseInterface[]>
    {
        return Promise.all(protobotDefenseBuildsData.map(async (defenseData: any): Promise<UserDefenseInterface> => {
            const defense: any = {
                id: defenseData.name.replace(/\s/g, ''),
                label: defenseData.name,
                shards: defenseData.shards.map((shardName: string): string|null => getShardId(shardName)),
                relic: {
                    mods: await Promise.all(defenseData.mods.map(async (modName: any) => await getModId(modName))),
                    godlyStat: {
                        type: getGodlyStatType(defenseData.tertiary),
                        value: 0,
                    },
                },
            };

            if (defenseData.role) {
                defense.label += ` (${defenseData.role})`;
            }

            return defense as UserDefenseInterface;
        }));
    }

    async function getModId(modData: any): Promise<string|null>
    {
        let modName: string = modData.name.split(' or ')[0];
        modName = modName.split('/')[0].trim();
        let modId: string = modName.replace(/[\s-]/g, '_').toLowerCase();

        if (modId === '') {
            return null;
        }

        switch (modId) {
            case 'anti_goblin': modId = 'anti_gobu'; break;
            case 'unique_critical': case 'unique_crit_chance': modId = 'unique_critical_chance'; break;
            case 'unique_cd': modId = 'unique_critical_damage'; break;
        }

        const mod: ModInterface = await getModById(modId);

        if (mod) {
            return mod.id;
        }

        return modId + '_servo'
    }

    function getGodlyStatType(tertiaryStat: any): string
    {
        if (!tertiaryStat) return 'none';

        tertiaryStat = tertiaryStat.split(' / ')[0].trim();

        let godlyStatType = tertiaryStat.replace(/\s/g, '_').toLowerCase().trim();

        switch (godlyStatType) {
            case 'crit_chance': godlyStatType = 'critical_chance'; break;
            case 'crit_damage': godlyStatType = 'critical_damage'; break;
            case 'defense_resist': godlyStatType = 'defense_resistance'; break;
        }

        return godlyStatType
    }

    return { protobotDefenses }
}