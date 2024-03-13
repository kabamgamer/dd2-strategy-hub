import type { AscensionPointInterface } from "@/types";
import {DefenseHealthAP, DefensePowerAP, DefenseRangeAP, DefenseRateAP} from "@/data/AscensionPoints";

export default abstract class HasAscensionPoints {
    abstract ascensionPoints: AscensionPointInterface[]

    get defensePowerAP(): AscensionPointInterface | null {
        return this.ascensionPoints.find(ap => ap instanceof DefensePowerAP) ?? null
    }

    get defenseHealthAP(): AscensionPointInterface | null {
        return this.ascensionPoints.find(ap => ap instanceof DefenseHealthAP) ?? null
    }

    get defenseRangeAP(): AscensionPointInterface | null {
        return this.ascensionPoints.find(ap => ap instanceof DefenseRangeAP) ?? null
    }

    get defenseRateAP(): AscensionPointInterface | null {
        return this.ascensionPoints.find(ap => ap instanceof DefenseRateAP) ?? null
    }
}
