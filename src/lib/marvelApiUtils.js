import crypto from 'crypto';

const { apiKey, privateKey, marvelApiUri } = require('../config.json');

function makeHash(ts, pk, ak) {
  return crypto
    .createHash('md5')
    .update(ts + pk + ak)
    .digest('hex');
}
function getInitialConfig() {
  return {
    uri: marvelApiUri,
    qs: {
      apikey: apiKey,
    },
    headers: {
      'User-Agent': 'Request-Promise',
    },
    json: true, // Automatically parses the JSON string in the response
  };
}
export function getHashedConfigurator(endpoint) {
  if (!endpoint) throw new Error('An endpoint path is expected');
  return function hashedConfigurator(path, qs = {}) {
    const ts = new Date().getTime();
    const baseConfig = getInitialConfig();
    return {
      ...baseConfig,
      uri:
        path !== null && path !== undefined && path !== ''
          ? `${baseConfig.uri}/${endpoint}/${path}`
          : `${baseConfig.uri}/${endpoint}`,
      qs: {
        ...baseConfig.qs,
        ...qs,
        ts: String(ts),
        hash: makeHash(ts, privateKey, apiKey),
      },
    };
  };
}

export function composeCacheKey(config) {
  const { qs } = config;
  const keysToRemove = new Set(['ts', 'hash', 'apikey']);
  if (!qs) return config.uri;
  return Object.keys(config.qs)
    .filter(key => !keysToRemove.has(key))
    .reduce((ck, oKey) => {
      ck += `${oKey}=${qs[oKey]}`;
      return ck;
    }, `${config.uri}?`);
}
