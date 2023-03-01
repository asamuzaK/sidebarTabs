export function getStat(file: string): object;
export function isDir(dir: string): boolean;
export function isFile(file: string): boolean;
export function removeDir(dir: string): void;
export function readFile(file: string, opt?: {
    encoding?: string;
    flag?: string;
}): Promise<string | Buffer>;
export function createFile(file: string, value: string): Promise<string>;
export function fetchText(url: string): Promise<string>;
