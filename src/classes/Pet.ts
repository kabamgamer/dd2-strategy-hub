import type { PetInterface } from "@/types";

export default class Pet implements PetInterface {
    public defensePower: number = 0;
    public defenseHealth: number = 0;
}
