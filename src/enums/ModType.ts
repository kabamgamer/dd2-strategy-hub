export default class ModType {
    static Power: ModType = new ModType('power');
    static Anti: ModType = new ModType('anti');

    constructor(
        public readonly id: string
    ) {}
}
