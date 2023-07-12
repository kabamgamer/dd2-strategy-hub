export default class ModType {
    static Power: ModType = new ModType('power');
    static Anti: ModType = new ModType('anti');
    static Diverse: ModType = new ModType('diverse');

    constructor(
        public readonly id: string
    ) {}
}
