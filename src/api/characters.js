import resource from 'resource-router-middleware';
import rp from 'request-promise';
import crypto from 'crypto';
import characters from '../models/characters';

const apiKey = 'abbcb54834de36c46b6425c2a3c9dcae';
const privateKey = 'b0efd2fc2bb9121675ccc0baae4bdceb063866d9';
function getTs() {
  return new Date().getTime();
}
function getHash(ts, pk, ak) {
  return crypto
    .createHash('md5')
    .update(ts + pk + ak)
    .digest('hex');
}

const baseCfg = {
  uri: 'https://gateway.marvel.com:443/v1/public/characters',
  qs: {
    apikey: apiKey, // -> uri + '?access_token=xxxxx%20xxxxx'
  },
  headers: {
    'User-Agent': 'Request-Promise',
  },
  json: true, // Automatically parses the JSON string in the response
};

export default ({ config, db }) =>
  resource({
    /** Property name to store preloaded entity on `request`. */
    id: 'character',

    /** For requests with an `id`, you can auto-load the entity.
     *  Errors terminate the request, success sets `req[id] = data`.
     */
    load(req, id, callback) {
      let character = characters.find(character => character.id === id),
        err = character ? null : 'Not found';
      callback(err, character);
    },

    /** GET / - List all entities */
    index({ params }, res) {
      const ts = getTs();
      const hash = getHash(ts, privateKey, apiKey);
      const conf = {
        ...baseCfg,
        qs: {
          ...baseCfg.qs,
          ts: String(ts),
          hash,
        },
      };
      rp(baseCfg)
        .then(data => res.json(data))
        .catch(e => res.json(conf));
      // setTimeout(() => res.json(characters), 2000)
      // res.json(characters);
    },

    /** POST / - Create a new entity */
    create({ body }, res) {
      body.id = characters.length.toString(36);
      characters.push(body);
      res.json(body);
    },

    /** GET /:id - Return a given entity */
    read({ character }, res) {
      res.json(character);
    },

    /** PUT /:id - Update a given entity */
    update({ character, body }, res) {
      for (const key in body) {
        if (key !== 'id') {
          character[key] = body[key];
        }
      }
      res.sendStatus(204);
    },

    /** DELETE /:id - Delete a given entity */
    delete({ character }, res) {
      characters.splice(characters.indexOf(character), 1);
      res.sendStatus(204);
    },
  });
