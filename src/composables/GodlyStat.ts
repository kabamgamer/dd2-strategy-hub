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

    function getMaxStatForGodlyType(godlyStatType: string): number {
        const maxStats: {[godlyStatType: string]: number} = {
            'critical_damage': 30,
            'critical_chance': 10,
            'defense_range': 600,
            'defense_resistance': 10,
        }

        return maxStats[godlyStatType] || 0;
    }

    return { getGodlyTypes, getGodlyStatLabelByType, getMaxStatForGodlyType }
}