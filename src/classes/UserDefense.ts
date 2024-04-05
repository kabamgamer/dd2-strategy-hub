import type { UserDataStoreDefenseInterface } from "@/stores/UserData";

import HasAscensionPoints from "@/traits/HasAscensionPoints";

import type { DefenseRootInterface, ModInterface, ShardInterface, UserDefenseInterface } from "@/types";

export default class UserDefense implements UserDataStoreDefenseInterface {
    public readonly incrementId: number;
    public readonly userData: UserDefenseInterface;
    public readonly defenseData?: DefenseRootInterface;
    public readonly userMods: ModInterface[];
    public readonly userShards: ShardInterface[];

    constructor(
        userDataStoreDefense: {
            incrementId: number
            userData: UserDefenseInterface,
            defenseData?: DefenseRootInterface,
            userMods: ModInterface[],
            userShards: ShardInterface[],
        },
        // Indicates whether this data is child data of another defense (eg. poison damage from Poison Dart Tower)
        public readonly parent?: string
    ) {
        this.incrementId = userDataStoreDefense.incrementId
        this.userData = userDataStoreDefense.userData
        this.defenseData = userDataStoreDefense.defenseData
        this.userMods = userDataStoreDefense.userMods
        this.userShards = userDataStoreDefense.userShards
    }

    get isBuffDefense(): boolean {
        return this.userData.id === 'BoostAura' || this.userData.id === 'BuffBeam'
    }
    
    get ascensionDefenseHealth(): number {
        if (this.parent) {
            return 0;
        }

        if (!this.defenseData || !(this.defenseData instanceof HasAscensionPoints) || !this.defenseData.defenseHealthAP) {
            return 0;
        }

        return this.defenseData.defenseHealthAP.getStatForLevel('defenseHealth', this.userData.ascensionPoints.defense_health ?? 0)
    }
    
    get ascensionDefensePower(): number {
        if (!this.defenseData || !(this.defenseData instanceof HasAscensionPoints)) {
            return 0;
        }
        
        if (this.parent === 'Pufferfish') {
            return this.defenseData.defenseRangeAP?.getStatForLevel('defensePower', this.userData.ascensionPoints.defense_range ?? 0) ?? 0;
        }

        const rangeGambitSubtraction = this.defenseData.defenseRangeAP?.getStatForLevel('defensePower', this.userData.ascensionPoints.defense_range ?? 0) ?? 0;
        const ascensionDefensePower = this.defenseData.defensePowerAP?.getStatForLevel('defensePower', this.userData.ascensionPoints.defense_power ?? 0) ?? 0;
        return rangeGambitSubtraction + ascensionDefensePower
    }
    
    get ascensionRange(): number {
        if (!this.defenseData || !(this.defenseData instanceof HasAscensionPoints) || !this.defenseData.defenseRangeAP) {
            return 0;
        }

        return this.defenseData.defenseRangeAP.getStatForLevel('defenseRange', this.userData.ascensionPoints.defense_range ?? 0)
    }
    
    get ascensionRate(): number {
        if (!this.defenseData || !(this.defenseData instanceof HasAscensionPoints) || !this.defenseData.defenseRateAP) {
            return 0;
        }

        return this.defenseData.defenseRateAP.getStatForLevel('defenseRate', this.userData.ascensionPoints.defense_rate ?? 0)
    }
}
