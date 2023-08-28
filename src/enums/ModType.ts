export default class ModType {
    static Power: ModType = new ModType('power');
    static Anti: ModType = new ModType('anti');
    static Unique: ModType = new ModType('unique');
    static Diverse: ModType = new ModType('diverse');

    constructor(
        public readonly id: string
    ) {}
}
