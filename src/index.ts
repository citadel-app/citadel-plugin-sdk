// Re-export core interfaces that plugin authors need
export type {
    IModule,
    RendererRegistrar,
    MainRegistrar,
    ProviderRegistration,
    LinkSearchProvider,
    CrossLinkHandler,
    ExternalDataHandler,
    NavigationItem,
    SidebarItem,
    ScopedAPI,
    CoreServices,
    ModuleDefinition,
    WorkspaceContext
} from '@citadel-app/core';

export * from './plugin-base';
export * from './main';
export * from './renderer';

export const __sdkVersion = "1.1.2";
