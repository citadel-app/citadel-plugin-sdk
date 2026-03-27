import { IModule, MainRegistrar, RendererRegistrar, WorkspaceContext } from '@citadel-app/core';

export interface PluginConfig<T = any> {
    id: string;
    version?: string;
    main?: {
        ipcs?: Record<string, (registrar: MainRegistrar, ...args: any[]) => Promise<any> | any>;
        sidecars?: any[];
        onActivate?: (registrar: MainRegistrar, workspace: WorkspaceContext | null) => Promise<void> | void;
    };
    renderer?: {
        sidebar?: any[];
        navigation?: any[];
        routes?: { path: string, component: any }[];
        settingsConfig?: any;
        providers?: { entry: any, component: any }[];
        linkSearchProviders?: any[];
        crossLinkHandlers?: any[];
        onActivate?: (registrar: RendererRegistrar) => Promise<void> | void;
    };
}

/**
 * High-level factory to define a Citadel plugin with minimal boilerplate.
 * Automatically handles namespacing and common registration patterns.
 */
export function definePlugin<T = any>(config: PluginConfig<T>): IModule {
    return {
        id: config.id,
        version: config.version || '1.1.1',
        ipcs: config.main?.ipcs ? Object.keys(config.main.ipcs) : [],
        
        onMainActivate: async (registrar: MainRegistrar, workspace: WorkspaceContext | null) => {
            // 1. Register Sidecars
            if (config.main?.sidecars && (registrar as any).registerSidecar) {
                config.main.sidecars.forEach(sidecar => (registrar as any).registerSidecar(sidecar));
            }

            // 2. Register IPC Handlers
            if (config.main?.ipcs) {
                Object.entries(config.main.ipcs).forEach(([method, handler]) => {
                    registrar.handle(method as any, (...args: any[]) => handler(registrar, ...args));
                });
            }

            // 3. custom activation
            if (config.main?.onActivate) {
                await config.main.onActivate(registrar, workspace);
            }
        },

        onRendererActivate: async (registrar: RendererRegistrar) => {
            // 1. Register UI Items
            if (config.renderer?.sidebar) {
                config.renderer.sidebar.forEach(item => registrar.registerSidebarItem(item));
            }
            if (config.renderer?.navigation) {
                config.renderer.navigation.forEach(item => registrar.registerNavigationItem(item));
            }
            if (config.renderer?.routes) {
                config.renderer.routes.forEach(route => registrar.registerRoute(route.path, route.component));
            }

            // 2. Register Providers & Handlers
            if (config.renderer?.providers) {
                config.renderer.providers.forEach(p => registrar.registerProvider(p.entry, p.component));
            }
            if (config.renderer?.linkSearchProviders) {
                config.renderer.linkSearchProviders.forEach(p => registrar.registerLinkSearchProvider(p));
            }
            if (config.renderer?.crossLinkHandlers) {
                config.renderer.crossLinkHandlers.forEach(h => registrar.registerCrossLinkHandler(h));
            }

            // 3. Settings
            if (config.renderer?.settingsConfig) {
                registrar.registerPluginSettingsConfig(config.renderer.settingsConfig);
            }

            // 4. Custom activation
            if (config.renderer?.onActivate) {
                await config.renderer.onActivate(registrar);
            }
        }
    } as any;
}
