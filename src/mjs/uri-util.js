/**
 * uri-util.js
 */

/* shared */
import { getType, isString } from './common.js';

/* constants */
const HEX = 16;

/**
 * URI schemes
 *
 * @see {@link https://www.iana.org/assignments/uri-schemes/uri-schemes.xhtml}
 *      - Historical schemes omitted
 *      - Added 'moz-extension' scheme
 */
export class URISchemes {
  /* private fields */
  #schemes;

  /**
   * construct
   */
  constructor() {
    // TODO: import json from lib/iana
    this.#schemes = new Set([
      'aaa',
      'aaas',
      'about',
      'acap',
      'acct',
      'acd',
      'acr',
      'adiumxtra',
      'adt',
      'afp',
      'afs',
      'aim',
      'amss',
      'android',
      'appdata',
      'apt',
      'ar',
      'ark',
      'attachment',
      'aw',
      'barion',
      'beshare',
      'bitcoin',
      'bitcoincash',
      'blob',
      'bolo',
      'browserext',
      'cabal',
      'calculator',
      'callto',
      'cap',
      'cast',
      'casts',
      'chrome',
      'chrome-extension',
      'cid',
      'coap',
      'coaps',
      'com-eventbrite-attendee',
      'content',
      'content-type',
      'crid',
      'cstr',
      'cvs',
      'dab',
      'dat',
      'data',
      'dav',
      'diaspora',
      'dict',
      'did',
      'dis',
      'dlna-playcontainer',
      'dlna-playsingle',
      'dns',
      'dntp',
      'doi',
      'dpp',
      'drm',
      'dtmi',
      'dtn',
      'dvb',
      'dvx',
      'dweb',
      'ed2k',
      'eid',
      'elsi',
      'embedded',
      'ens',
      'ethereum',
      'example',
      'facetime',
      'feed',
      'feedready',
      'fido',
      'file',
      'finger',
      'first-run-pen-experience',
      'fish',
      'fm',
      'ftp',
      'fuchsia-pkg',
      'geo',
      'gg',
      'git',
      'gitoid',
      'gizmoproject',
      'go',
      'gopher',
      'graph',
      'gtalk',
      'h323',
      'ham',
      'hcap',
      'hcp',
      'http',
      'https',
      'hxxp',
      'hxxps',
      'hydrazone',
      'hyper',
      'iax',
      'icap',
      'icon',
      'im',
      'imap',
      'info',
      'iotdisco',
      'ipfs',
      'ipn',
      'ipns',
      'ipp',
      'ipps',
      'irc',
      'irc6',
      'ircs',
      'iris',
      'iris.beep',
      'iris.lwz',
      'iris.xpc',
      'iris.xpcs',
      'isostore',
      'itms',
      'jabber',
      'jar',
      'jms',
      'keyparc',
      'lastfm',
      'lbry',
      'ldap',
      'ldaps',
      'leaptofrogans',
      'lorawan',
      'lpa',
      'lvlt',
      'magnet',
      'mailto',
      'maps',
      'market',
      'matrix',
      'message',
      'microsoft.windows.camera',
      'microsoft.windows.camera.multipicker',
      'microsoft.windows.camera.picker',
      'mid',
      'mms',
      'mongodb',
      'moz',
      'moz-extension',
      'ms-access',
      'ms-appinstaller',
      'ms-browser-extension',
      'ms-calculator',
      'ms-drive-to',
      'ms-enrollment',
      'ms-excel',
      'ms-eyecontrolspeech',
      'ms-gamebarservices',
      'ms-gamingoverlay',
      'ms-getoffice',
      'ms-help',
      'ms-infopath',
      'ms-inputapp',
      'ms-lockscreencomponent-config',
      'ms-media-stream-id',
      'ms-meetnow',
      'ms-mixedrealitycapture',
      'ms-mobileplans',
      'ms-newsandinterests',
      'ms-officeapp',
      'ms-people',
      'ms-powerpoint',
      'ms-project',
      'ms-publisher',
      'ms-restoretabcompanion',
      'ms-screenclip',
      'ms-screensketch',
      'ms-search',
      'ms-search-repair',
      'ms-secondary-screen-controller',
      'ms-secondary-screen-setup',
      'ms-settings',
      'ms-settings-airplanemode',
      'ms-settings-bluetooth',
      'ms-settings-camera',
      'ms-settings-cellular',
      'ms-settings-cloudstorage',
      'ms-settings-connectabledevices',
      'ms-settings-displays-topology',
      'ms-settings-emailandaccounts',
      'ms-settings-language',
      'ms-settings-location',
      'ms-settings-lock',
      'ms-settings-nfctransactions',
      'ms-settings-notifications',
      'ms-settings-power',
      'ms-settings-privacy',
      'ms-settings-proximity',
      'ms-settings-screenrotation',
      'ms-settings-wifi',
      'ms-settings-workplace',
      'ms-spd',
      'ms-stickers',
      'ms-sttoverlay',
      'ms-transit-to',
      'ms-useractivityset',
      'ms-virtualtouchpad',
      'ms-visio',
      'ms-walk-to',
      'ms-whiteboard',
      'ms-whiteboard-cmd',
      'ms-word',
      'msnim',
      'msrp',
      'msrps',
      'mss',
      'mt',
      'mtqp',
      'mumble',
      'mupdate',
      'mvn',
      'news',
      'nfs',
      'ni',
      'nih',
      'nntp',
      'notes',
      'num',
      'ocf',
      'oid',
      'onenote',
      'onenote-cmd',
      'opaquelocktoken',
      'openpgp4fpr',
      'otpauth',
      'palm',
      'paparazzi',
      'payment',
      'payto',
      'pkcs11',
      'platform',
      'pop',
      'pres',
      'proxy',
      'psyc',
      'pttp',
      'pwid',
      'qb',
      'query',
      'quic-transport',
      'redis',
      'rediss',
      'reload',
      'res',
      'resource',
      'rmi',
      'rsync',
      'rtmfp',
      'rtmp',
      'rtsp',
      'rtsps',
      'rtspu',
      'sarif',
      'secondlife',
      'secret-token',
      'service',
      'session',
      'sftp',
      'sgn',
      'shc',
      'sieve',
      'simpleledger',
      'simplex',
      'sip',
      'sips',
      'skype',
      'smb',
      'smp',
      'sms',
      'smtp',
      'snmp',
      'soap.beep',
      'soap.beeps',
      'soldat',
      'spiffe',
      'spotify',
      'ssb',
      'ssh',
      'starknet',
      'steam',
      'stun',
      'stuns',
      'submit',
      'svn',
      'swh',
      'swid',
      'swidpath',
      'tag',
      'taler',
      'teamspeak',
      'tel',
      'teliaeid',
      'telnet',
      'tftp',
      'things',
      'thismessage',
      'tip',
      'tn3270',
      'tool',
      'turn',
      'turns',
      'tv',
      'udp',
      'unreal',
      'urn',
      'ut2004',
      'uuid-in-package',
      'v-event',
      'vemmi',
      'ventrilo',
      'ves',
      'view-source',
      'vnc',
      'vscode',
      'vscode-insiders',
      'vsls',
      'w3',
      'wcr',
      'web3',
      'webcal',
      'wifi',
      'ws',
      'wss',
      'wtai',
      'wyciwyg',
      'xcon',
      'xcon-userid',
      'xfire',
      'xmlrpc.beep',
      'xmlrpc.beeps',
      'xmpp',
      'xri',
      'ymsgr',
      'z39.50r',
      'z39.50s'
    ]);
  }

  /**
   * get scheme
   *
   * @returns {Array.<string>} - array of schemes
   */
  get() {
    return [...this.#schemes];
  }

  /**
   * has scheme
   *
   * @param {string} scheme - scheme
   * @returns {boolean} - result
   */
  has(scheme) {
    return this.#schemes.has(scheme);
  }

  /**
   * add scheme
   * NOTE: `javascript` and/or `vbscript` schemes are not allowed to register
   *
   * @param {string} scheme - scheme
   * @returns {Array.<string>} - array of schemes
   */
  add(scheme) {
    if (!isString(scheme)) {
      throw new TypeError(`Expected String but got ${getType(scheme)}.`);
    } else if (/(?:java|vb)script/.test(scheme) ||
               !/^[a-z][a-z0-9+\-.]*$/.test(scheme)) {
      throw new Error(`Invalid scheme: ${scheme}`);
    }
    this.#schemes.add(scheme);
    return [...this.#schemes];
  }

  /**
   * remove scheme
   *
   * @param {string} scheme - scheme
   * @returns {boolean} - result
   */
  remove(scheme) {
    return this.#schemes.delete(scheme);
  }
};

const uriSchemes = new URISchemes();

/**
 * is URI
 *
 * @param {string} uri - URI input
 * @returns {boolean} - result
 */
export const isUri = uri => {
  let res;
  if (isString(uri)) {
    try {
      const { protocol } = new URL(uri);
      const scheme = protocol.replace(/:$/, '');
      const schemeParts = scheme.split('+');
      res = /^(?:ext|web)\+[a-z]+$/.test(scheme) ||
            schemeParts.every(s => uriSchemes.has(s));
    } catch (e) {
      res = false;
    }
  }
  return !!res;
};

/**
 * get URL encoded string
 *
 * @param {string} str - string
 * @returns {string} - URL encoded string
 */
export const getUrlEncodedString = str => {
  if (!isString(str)) {
    throw new TypeError(`Expected String but got ${getType(str)}.`);
  }
  const chars = [];
  for (const ch of str) {
    chars.push(`%${ch.charCodeAt(0).toString(HEX).toUpperCase()}`);
  }
  return chars.join('');
};

/**
 * escape URL encoded HTML special chars
 *
 * @param {string} ch - URL encoded (percent encoded) char
 * @returns {string} - escaped URL encoded HTML special char / URL encoded char
 */
export const escapeUrlEncodedHtmlChars = ch => {
  if (isString(ch)) {
    if (/^%[\dA-F]{2}$/i.test(ch)) {
      ch = ch.toUpperCase();
    } else {
      throw new Error(`${ch} is not a URL encoded character.`);
    }
  } else {
    throw new TypeError(`Expected String but got ${getType(ch)}.`);
  }
  const [amp, num, lt, gt, quot, apos] =
    ['&', '#', '<', '>', '"', "'"].map(getUrlEncodedString);
  let escapedChar;
  if (ch === amp) {
    escapedChar = `${amp}amp;`;
  } else if (ch === lt) {
    escapedChar = `${amp}lt;`;
  } else if (ch === gt) {
    escapedChar = `${amp}gt;`;
  } else if (ch === quot) {
    escapedChar = `${amp}quot;`;
  } else if (ch === apos) {
    escapedChar = `${amp}${num}39;`;
  } else {
    escapedChar = ch;
  }
  return escapedChar;
};

/**
 * parse base64
 *
 * @see {@link https://github.com/file/file/blob/master/src/encoding.c}
 * @param {string} data - base64 data
 * @returns {string} - parsed data / base64 data
 */
export const parseBase64 = data => {
  if (!isString(data)) {
    throw new TypeError(`Expected String but got ${getType(data)}.`);
  }
  const bin = atob(data);
  const uint8arr = Uint8Array.from([...bin].map(c => c.charCodeAt(0)));
  const textChars = new Set([0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x1b]);
  for (let i = 0x20; i < 0x7f; i++) {
    textChars.add(i);
  }
  for (let i = 0x80; i <= 0xff; i++) {
    textChars.add(i);
  }
  let parsedData;
  if (uint8arr.every(c => textChars.has(c))) {
    parsedData = bin;
  } else {
    parsedData = data;
  }
  return parsedData;
};

/**
 * sanitize URL
 * NOTE: `data` and/or `file` schemes must be explicitly allowed
 *
 * @param {string} url - URL input
 * @param {object} opt - options
 * @param {Array.<string>} [opt.allow] - array of allowed schemes
 * @param {Array.<string>} [opt.deny] - array of denied schemes
 * @param {boolean} [opt.parseData] - parse data URL, `true` if omitted
 * @returns {?string} - sanitized URL
 */
export const sanitizeUrl = (url, opt = {
  allow: [],
  deny: [],
  parseData: true
}) => {
  let sanitizedUrl;
  if (isUri(url)) {
    const { allow, deny, parseData } = opt ?? {};
    const { href, pathname, protocol } = new URL(url);
    const scheme = protocol.replace(/:$/, '');
    const schemeParts = scheme.split('+');
    const schemeMap = new Map([
      ['data', false],
      ['file', false]
    ]);
    if (Array.isArray(allow) && allow.length) {
      const items = Object.values(allow);
      for (let item of items) {
        if (isString(item)) {
          item = item.trim();
          if (item) {
            schemeMap.set(item, true);
          }
        }
      }
    }
    if (Array.isArray(deny) && deny.length) {
      const items = Object.values(deny);
      for (let item of items) {
        if (isString(item)) {
          item = item.trim();
          if (item) {
            schemeMap.set(item, false);
          }
        }
      }
    }
    let bool;
    for (const [key, value] of schemeMap.entries()) {
      bool = value || (scheme !== key && schemeParts.every(s => s !== key));
      if (!bool) {
        break;
      }
    }
    if (bool) {
      let toBeSanitizedUrl = href;
      if (schemeParts.includes('data') && (parseData ?? true)) {
        const [header, data] = pathname.split(',');
        const mediaType = header.split(';');
        const isBase64 = mediaType.pop() === 'base64';
        if (isBase64) {
          const parsedData = parseBase64(data);
          if (parsedData !== data) {
            toBeSanitizedUrl = `${scheme}:${mediaType.join(';')},${parsedData}`;
          }
        }
      }
      const [amp, lt, gt, quot, apos] =
        ['&', '<', '>', '"', "'"].map(getUrlEncodedString);
      const regChars = /[<>"']/g;
      const regAmp = new RegExp(amp, 'g');
      const regEncodedChars = new RegExp(`(${lt}|${gt}|${quot}|${apos})`, 'g');
      sanitizedUrl = toBeSanitizedUrl.replace(regChars, getUrlEncodedString)
        .replace(regAmp, escapeUrlEncodedHtmlChars)
        .replace(regEncodedChars, escapeUrlEncodedHtmlChars);
    }
  }
  return sanitizedUrl || null;
};

/* alias exports */
export {
  uriSchemes as default,
  isUri as isURI,
  sanitizeUrl as sanitizeURL
};
