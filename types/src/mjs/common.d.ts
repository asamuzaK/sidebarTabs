export function logErr(e: object): boolean;
export function throwErr(e: object): never;
export function logWarn(msg: any): boolean;
export function logMsg(msg: any): object;
export function getType(o: any): string;
export function isString(o: any): boolean;
export function isObjectNotEmpty(o: any): boolean;
export function sleep(msec?: number, doReject?: boolean): Promise<any> | null;
export function addElementContentEditable(elm: object, focus?: boolean): object;
export function removeElementContentEditable(elm: object): object;
export function setElementDataset(elm: object, key: string, value: string): object;