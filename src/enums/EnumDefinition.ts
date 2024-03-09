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
    public static createEnumCollection(values: string[]): this[] {
        const collection: any =  values.map(value => this.createEnum(value));
        return collection.filter((value: any) => value !== undefined);
    }

    public equals(expectedEnum: EnumDefinition): boolean {
        return expectedEnum.id === this.id;
    }
}
