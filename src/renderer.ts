import { RendererRegistrar } from '@citadel-app/core';

/**
 * Declaratively register multiple UI items at once.
 */
export function registerUI(registrar: RendererRegistrar, config: {
    sidebar?: any[];
    navigation?: any[];
}) {
    if (config.sidebar) {
        config.sidebar.forEach(item => registrar.registerSidebarItem(item));
    }
    if (config.navigation) {
        config.navigation.forEach(item => registrar.registerNavigationItem(item));
    }
}
