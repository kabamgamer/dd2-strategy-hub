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
        }
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
        if (!this.defenseData || !(this.defenseData instanceof HasAscensionPoints)) {
            return 0;
        }

        return this.defenseData.defenseHealthAP?.setUpgradeLevel(this.userData.ascensionPoints.defense_health ?? 0)?.defenseHealth ?? 0
    }
    
    get ascensionDefensePower(): number {
        if (!this.defenseData || !(this.defenseData instanceof HasAscensionPoints)) {
            return 0;
        }

        const rangeGambitSubtraction = this.defenseData.defenseRangeAP?.setUpgradeLevel(this.userData.ascensionPoints.defense_range ?? 0)?.defensePower ?? 0;
        const ascensionDefensePower = this.defenseData.defensePowerAP?.setUpgradeLevel(this.userData.ascensionPoints.defense_power ?? 0)?.defensePower ?? 0
        return rangeGambitSubtraction + ascensionDefensePower
    }
    
    get ascensionRange(): number {
        if (!this.defenseData || !(this.defenseData instanceof HasAscensionPoints)) {
            return 0;
        }

        return this.defenseData.defenseRangeAP?.setUpgradeLevel(this.userData.ascensionPoints.defense_range ?? 0)?.defenseRange ?? 0
    }
    
    get ascensionRate(): number {
        if (!this.defenseData || !(this.defenseData instanceof HasAscensionPoints)) {
            return 0;
        }

        return this.defenseData.defenseRateAP?.setUpgradeLevel(this.userData.ascensionPoints.defense_rate ?? 0)?.defenseRate ?? 0
    }
}
