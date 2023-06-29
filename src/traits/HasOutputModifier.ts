import OutputModifier from "@/classes/OutputModifier";

export default class HasOutputModifier {

    protected getOutputModifierForValue(value?: string): OutputModifier | undefined {
        if (value === '' || value === undefined) {
            return undefined
        }

        const modifierValue: string = value.replace('+', '');
        if (modifierValue.includes('%')) {
            return new OutputModifier(parseFloat(modifierValue.replace('%', '')))
        }

        return new OutputModifier(undefined, parseFloat(modifierValue))
    }

}
