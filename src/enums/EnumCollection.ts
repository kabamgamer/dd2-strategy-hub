import type EnumDefinition from "./EnumDefinition";

export default class EnumCollection<TEnum extends EnumDefinition> {
    constructor(
        public enums: TEnum[] = []
    ) {}

    public iterate(): TEnum[] {
        return this.enums;
    }

    public contains(expectedEnum: TEnum): boolean {
        return this.enums.some((currentEnum: TEnum) => currentEnum.equals(expectedEnum));
    }
    
    get length(): number {
        return this.enums.length;
    }
}
