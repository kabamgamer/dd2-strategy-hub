import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/User";
import type { User } from "@/stores/User";

let authLoginModal: any;

export function useAcl(authLoginModalObject?: any): any {
    if (authLoginModalObject) {
        authLoginModal = authLoginModalObject;
    }

    // Return true if only login is required, conditional logic can be added here
    const ACCESS_CONTROL_LIST: {[access: string]: any} = {
        'map.create': (): boolean => true,
        'map.update': (user: User, communityMap): boolean => user.id === communityMap.author.id,
    }

    function can(ability: string, aclArguments: any[]): boolean {
        const { user } = storeToRefs(useUserStore());

        if (!user.value) {
            return false;
        }

        if (!ACCESS_CONTROL_LIST[ability]) {
            return false;
        }

        return ACCESS_CONTROL_LIST[ability](user.value, ...aclArguments);
    }

    function promptLogin(): void {
        authLoginModal?.show();
    }

    function promptLoginIfCant(ability: string, aclArguments: any[]): boolean {
        if (!can(ability, aclArguments)) {
            promptLogin();
            return false;
        }

        return true
    }

    return { can, promptLogin, promptLoginIfCant };
}
