import { MainRegistrar } from '@citadel-app/core';

/**
 * Helper to register a collection of IPC handlers.
 * Useful for breaking larger plugins into multiple service files.
 */
export function registerIpcs(registrar: MainRegistrar, ipcs: Record<string, Function>) {
    Object.entries(ipcs).forEach(([method, handler]) => {
        registrar.handle(method as any, (...args: any[]) => handler(...args));
    });
}

/**
 * Helper to manage sidecar lifecycles automatically.
 */
export async function manageSidecars(registrar: MainRegistrar, sidecars: any[]) {
    if ((registrar as any).registerSidecar) {
        sidecars.forEach(sidecar => (registrar as any).registerSidecar(sidecar));
    }
}
