import EnumCollection from "./EnumCollection";

export default abstract class EnumDefinition {
    constructor(
        public readonly id: string
    ) {}

    // @ts-ignore
    public static createEnum(value?: string): undefined|this {
        if (value === '' || value === undefined) {
            return undefined;
        }

        // @ts-ignore
        return new this(value.trim());
    }

    // @ts-ignore
    public static createEnumCollection(values: string[]): EnumCollection<this> {
        const collection: EnumCollection<EnumDefinition> = new EnumCollection<EnumDefinition>(values.map(value => this.createEnum(value)).filter((value: any) => value !== undefined));
        return collection;
    }

    public equals(expectedEnum: EnumDefinition): boolean {
        return expectedEnum.id === this.id;
    }
}
