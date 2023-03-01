export function getSessionTabList(key: string, windowId?: number): Promise<object>;
export const mutex: Set<any>;
export function saveSessionTabList(domStr: string, windowId?: number): Promise<boolean>;
export function requestSaveSession(): Promise<Function | null>;
export { ports } from "./port.js";
