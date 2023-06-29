export default class OutputModifier {
    percentage?: number;
    additive?: number;

    constructor(percentage: undefined | number = 100, additive: undefined | number = 0) {
        this.percentage = percentage;
        this.additive = additive;
    }

    calculate(baseValue: number): number {
        if (this.percentage === undefined) {
            return baseValue + (this.additive ?? 0);
        }

        return baseValue * this.percentage / 100 + (this.additive ?? 0);
    }
}
