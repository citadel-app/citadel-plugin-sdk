import { IModule, MainRegistrar, RendererRegistrar, WorkspaceContext } from '@citadel-app/core';

export interface PluginConfig<T = any> {
    id: string;
    version?: string;
    main?: {
        providesIpcs?: string[];
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
        globalComponents?: { region: string, component: any }[];
        contentModules?: Record<string, any>;
        contentViewers?: Record<string, any>;
        sectionEditors?: Record<string, any>;
        sectionTemplates?: any[];
        statusWidgets?: { id: string, group: string, component: any }[];
        externalDataHandlers?: any[];
        linkSearchProviders?: any[];
        crossLinkHandlers?: any[];
        onActivate?: (registrar: RendererRegistrar, api: any) => Promise<void> | void;
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
        ipcs: config.main?.providesIpcs || (config.main?.ipcs ? Object.keys(config.main.ipcs) : []),
        sidecars: config.main?.sidecars || [],
        permissions: {
            ipc: config.main?.ipcs ? Object.keys(config.main.ipcs) : []
        },

        // --- Declarative UI mappings ---
        contentModules: config.renderer?.contentModules,
        contentViewers: config.renderer?.contentViewers,
        sectionEditors: config.renderer?.sectionEditors,
        sectionTemplates: config.renderer?.sectionTemplates,
        statusWidgets: config.renderer?.statusWidgets,
        globalComponents: config.renderer?.globalComponents,
        sidebarItems: config.renderer?.sidebar,
        navigationItems: config.renderer?.navigation,
        providers: config.renderer?.providers,
        linkSearchProviders: config.renderer?.linkSearchProviders,
        crossLinkHandlers: config.renderer?.crossLinkHandlers,
        externalDataHandlers: config.renderer?.externalDataHandlers,

        
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
            if (config.renderer?.globalComponents) {
                config.renderer.globalComponents.forEach(c => registrar.registerGlobalComponent(c.region, c.component));
            }
            if (config.renderer?.linkSearchProviders) {
                config.renderer.linkSearchProviders.forEach(p => registrar.registerLinkSearchProvider(p));
            }
            if (config.renderer?.crossLinkHandlers) {
                config.renderer.crossLinkHandlers.forEach(h => registrar.registerCrossLinkHandler(h));
            }

            if (config.renderer?.externalDataHandlers) {
                config.renderer.externalDataHandlers.forEach(h => registrar.registerExternalDataHandler(h));
            }

            // 3. Settings
            if (config.renderer?.settingsConfig) {
                registrar.registerPluginSettingsConfig(config.renderer.settingsConfig);
            }

            // 4. Custom activation
            if (config.renderer?.onActivate) {
                await config.renderer.onActivate(registrar, (registrar as any).api || {});
            }
        }
    } as any;
}
