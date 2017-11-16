import Promise from 'bluebird';
import rp from 'request-promise';
import { composeCacheKey } from './marvelApiUtils';

export function getCachedWrapper(db) {
  return function(config) {
    const cacheKey = composeCacheKey(config);
    return db
      .getItem(cacheKey)
      .then(
        cachedData => (cachedData ? Promise.resolve(cachedData) : rp(config)),
      )
      .then(data => {
        if (!data.fromLocalCache)
          db.setItem(cacheKey, { ...data, fromLocalCache: true });
        return Promise.resolve(data);
      });
  };
}
