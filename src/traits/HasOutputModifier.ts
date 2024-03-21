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
            const mutatorName: string = mutatorParts[0];
            const mutatorValues: undefined|string = mutatorParts[1];

            mutators[mutatorName] = {}
            if (mutatorValues === undefined) {
                return
            }

            mutatorValues.split(';').forEach((mutatorValue: string) => {
                // Check if the mutator value contains arguments in between []
                if (!mutatorValue.includes('[') || !mutatorValue.includes(']')) {
                    mutators[mutatorName][mutatorValue] = true
                    return
                }

                const mutatorValueParts: string[] = mutatorValue.split('[');
                const mutatorValueName: string = mutatorValueParts[0];
                const mutatorValueArguments: string = mutatorValueParts[1].replace(']', '');
                mutators[mutatorName][mutatorValueName] = mutatorValueArguments.split(',')
            })
        })

        return mutators
    }


}
