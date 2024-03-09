import EnumDefinition from "@/enums/EnumDefinition";

export default class ModType extends EnumDefinition {
    static Power: ModType = new this('power');
    static Anti: ModType = new this('anti');
    static Unique: ModType = new this('unique');
    static Diverse: ModType = new this('diverse');
}
