export const folderMap: Map<any, any>;
export function createFolderMap(node: string, recurse?: boolean): Promise<void>;
export function getFolderMap(recurse?: boolean): Promise<object>;
export function getBookmarkLocationId(): Promise<string | null>;
export function bookmarkTabs(nodes: any[], name?: string): Promise<any[]>;
