import rp from 'request-promise';
import resource from 'resource-router-middleware';
import { getHashedConfigurator } from '../lib/marvelApiUtils';
import { getCachedWrapper as cw } from '../lib/cacheServices';
import characters from '../models/characters';

const getRequestConfig = getHashedConfigurator('characters');
export default ({ config, db }) =>
  resource({
    /** Property name to store preloaded entity on `request`. */
    id: 'characters',

    /** For requests with an `id`, you can auto-load the entity.
     *  Errors terminate the request, success sets `req[id] = data`.
     */
    load(req, id, callback) {
      const config = getRequestConfig(null, {
        nameStartsWith: id,
      });
      cw(db)(config)
        .then(results => callback(null, results))
        .catch(e => callback(new Error(e)));
    },

    /** GET / - List all entities */
    index({ params }, res) {
      const config = getRequestConfig();
      cw(db)(config)
        .then(cachedData => res.json(cachedData))
        .catch(e => res.json(e));
    },

    /** GET /:id - Return a given entity */
    read({ characters }, res) {
      res.json(characters);
    },
  });
