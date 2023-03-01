/**
 * index.js
 */

/* api */
import process from 'node:process';
import { parseCommand } from './modules/commander.js';
import { logErr, throwErr } from './modules/common.js';

/* process */
process.on('uncaughtException', throwErr);
process.on('unhandledRejection', logErr);

parseCommand(process.argv);
