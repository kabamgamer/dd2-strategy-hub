import type { UserDefenseSetupInterface } from "@/interaces";

export default class DataMigrations {
    public migrateDefenseSetups(data: object[]): UserDefenseSetupInterface[] {
        const migratedData: UserDefenseSetupInterface[] = []

        data.forEach((setup: any) => {
            if (Object.prototype.hasOwnProperty.call(setup, 'defensesIncrementIds')) {
                const defenses: { [id: string]: any } = {}
                setup.defensesIncrementIds.forEach((defenseIncrementId: number) => {
                    defenses[defenseIncrementId] = {
                        defenseCount: 1,
                    }
                })
                setup.defenses = defenses
                delete setup.defensesIncrementIds
            }

            migratedData.push(setup as UserDefenseSetupInterface)
        })

        return migratedData
    }
}
