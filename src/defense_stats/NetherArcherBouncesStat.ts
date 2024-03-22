import type { Ref } from "vue";
import type { DefenseStatInterface } from "@/types";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";

export default class NetherArcherBouncesStat implements DefenseStatInterface<{ [bounce: number]: number }> {
    public readonly template: string = 'NetherArcherBouncesStatTemplate'
    private readonly totalDps: Ref<number>
    private readonly defense: UserDataStoreDefenseInterface

    constructor(
        totalDps: Ref<number>,
        defense: UserDataStoreDefenseInterface
    ) {
        this.totalDps = totalDps
        this.defense = defense
    }

    get label(): string {
        return "DPS per bounce"
    }

    get value(): { [bounce: number]: number } {
        const bouncesDamageMultipliers = this.getBouncesDamageMultipliers()

        const bounces: { [bounce: number]: number } = {}
        for (let i: number = 1; i <= this.bounces; i++) {
            bounces[i] = this.totalDps.value * bouncesDamageMultipliers[i]
        }

        return bounces
    }

    get bounces(): number {
        if (this.hasGhostArrows) {
            return 8
        }

        return 3
    }

    get hasSpectralArrows(): boolean {
        return this.defense.userMods.some(mod => mod.id === 'spectral_arrows')
    }

    get hasGhostArrows(): boolean {
        return this.defense.userShards.some(shard => shard.id === 'ghost_arrows')
    }

    getBouncesDamageMultipliers(): { [bounce: number]: number } {
        if (this.hasSpectralArrows) {
            return {
                1: 1,
                2: .92,
                3: .84,
                4: .82,
                5: .78,
                6: .74,
                7: .72,
                8: .70,
            }
        }

        return {
            1: 1,
            2: .80,
            3: .60,
            4: .55,
            5: .45,
            6: .35,
            7: .30,
            8: .25,
        }
    }
}
