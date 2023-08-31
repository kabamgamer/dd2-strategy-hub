export default class OutputModifier {
    percentage?: number;
    additive?: number;

    constructor(percentage?: number, additive?: number) {
        this.percentage = percentage;
        this.additive = additive;
    }

    calculate(baseValue: number): number {
        if (this.percentage === undefined) {
            return baseValue + (this.additive ?? 0);
        }

        return baseValue * (1 + this.percentage / 100) + (this.additive ?? 0);
    }
}
