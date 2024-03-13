import type { RelicInterface } from "@/types";

export default class Relic implements RelicInterface {
    public defensePower: number = 0;
    public defenseHealth: number = 0;
    public mods: string[] = [];
}
