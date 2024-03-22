import type { OutputModifierMutatorsInterface } from "@/classes/OutputModifier";
import OutputModifier from "@/classes/OutputModifier";

export default class HasOutputModifier {

    protected getOutputModifierForValue(value?: string): OutputModifier | undefined {
        if (value === '' || value === undefined) {
            return undefined
        }

        const valuesAndMutators: string[] = value.split('|');
        const modifierValue: string = valuesAndMutators.splice(0,1)[0].replace('+', '');

        let mutators: OutputModifierMutatorsInterface|undefined;
        if (valuesAndMutators.length > 0) {
            mutators = this.getMutators(valuesAndMutators)
        }

        if (modifierValue.includes('%')) {
            return new OutputModifier(parseFloat(modifierValue.replace('%', '')), undefined, mutators)
        }

        return new OutputModifier(undefined, parseFloat(modifierValue), mutators)
    }

    private getMutators(valuesAndMutators: string[]): OutputModifierMutatorsInterface|undefined {
        const mutators: OutputModifierMutatorsInterface|any = {};

        valuesAndMutators.forEach((mutator: string) => {
            const mutatorParts: string[] = mutator.split(':');
            let mutatorName: string = mutatorParts[0];
            const mutatorValues: undefined|string = mutatorParts[1];

            if (mutatorValues === undefined && mutatorName.includes('=')) {
                const mutatorNameParts: string[] = mutatorName.split('=')
                mutatorName = mutatorNameParts[0]
                const mutatorValue = mutatorNameParts[1]
                mutators[mutatorName] = this.getMutatorScalarValue(mutatorValue)
                return
            }

            if (mutatorValues === undefined) {
                mutators[mutatorName] = true
                return
            }

            mutators[mutatorName] = {}
            if (!mutatorValues.includes('=') && !mutatorValues.includes(';')) {
                mutators[mutatorName][mutatorValues] = true
                return
            }

            mutatorValues.split(';').forEach((mutatorOption: string) => {
                const mutatorOptionParts: string[] = mutatorOption.split('=');
                const mutatorOptionName: string = mutatorOptionParts[0];
                const mutatorOptionValue: undefined|string = mutatorOptionParts[1];

                // Check if the mutator value contains arguments in between []
                if (!mutatorOptionValue) {
                    mutators[mutatorName][mutatorOptionName] = true
                    return
                }

                // Check if the mutator value contains arguments in between []
                if (!mutatorOptionValue.includes('[') || !mutatorOptionValue.includes(']')) {
                    mutators[mutatorName][mutatorOptionName] = this.getMutatorScalarValue(mutatorOptionValue)
                    return
                }

                const mutatorOptionValueArguments: string = mutatorOptionValue.replace(/[[\]]/g, '');
                mutators[mutatorName][mutatorOptionName] = mutatorOptionValueArguments.split(',')
            })
        })

        return mutators
    }

    private getMutatorScalarValue(mutatorValue: string): string|number {
        if (/^[+-]?(\d*[.])?\d+$/.test(mutatorValue)) {
            return parseFloat(mutatorValue)
        }

        return mutatorValue
    }
}
