export const ports: Map<any, any>;
export function removePort(portId: string): Promise<boolean>;
export function portOnDisconnect(port?: object): Promise<any>;
export function addPort(portId?: string): Promise<object>;
export function getPort(portId?: string, add?: boolean): Promise<object>;
