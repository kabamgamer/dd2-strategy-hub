import type { DefenseStatInterface, ModInterface, ShardInterface } from "@/types";

export default class NetherArcherBouncesStat implements DefenseStatInterface {
    public readonly template: string = 'NetherArcherBouncesStatTemplate'
    private readonly totalDps: number
    private readonly defenseMods: ModInterface[]
    private readonly defenseShards: ShardInterface[]

    constructor(
        totalDps: number,
        defenseMods: ModInterface[],
        defenseShards: ShardInterface[]
    ) {
        this.totalDps = totalDps
        this.defenseMods = defenseMods
        this.defenseShards = defenseShards
    }

    get label(): string {
        return "DPS per bounce"
    }

    get value(): { [bounce: number]: number } {
        const bouncesDamageMultipliers = this.getBouncesDamageMultipliers()

        const bounces: { [bounce: number]: number } = {}
        for (let i: number = 1; i <= this.bounces; i++) {
            bounces[i] = this.totalDps * bouncesDamageMultipliers[i]
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
        return this.defenseMods.some(mod => mod.id === 'spectral_arrows')
    }

    get hasGhostArrows(): boolean {
        return this.defenseShards.some(shard => shard.id === 'ghost_arrows')
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
