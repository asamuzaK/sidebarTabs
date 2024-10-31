export function clearDropTarget(): void;
export function createDroppedTextTabsInOrder(opts?: Array<any[]>, pop?: boolean): Promise<any> | undefined;
export function handleDroppedText(target: object, data: object): Promise<any> | null;
export function handleDroppedTabs(target: object, data: object): Promise<any> | null;
export function handleDrop(evt: object, opt?: {
    windowId: boolean;
}): (Promise<any> | undefined) | null;
export function handleDragEnd(evt: object): void;
export function handleDragLeave(evt: object): void;
export function handleDragOver(evt: object, opt?: {
    isMac: boolean;
    windowId: boolean;
}): void;
export function handleDragStart(evt: object, opt?: {
    isMac: boolean;
    windowId: boolean;
}): Promise<any[]> | undefined;
export { ports } from "./session.js";
