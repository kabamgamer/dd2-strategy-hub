export function useGodlyStat(): any {
    function getGodlyTypes(): { [type: string]: string } {
        return {
            'critical_damage': 'Critical damage',
            'critical_chance': 'Critical chance',
            'defense_range': 'Defense range',
            'defense_resistance': 'Defense resistance',
        }
    }
    
    function getGodlyStatLabelByType(godlyStatType?: string): string {
        if (!godlyStatType || godlyStatType === 'none') return 'No godly stat';

        const godlyTypes = getGodlyTypes()

        if (godlyTypes[godlyStatType]) return godlyTypes[godlyStatType];

        return 'Godly stat'
    }

    return { getGodlyTypes, getGodlyStatLabelByType }
}