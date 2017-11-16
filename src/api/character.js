import rp from 'request-promise';
import resource from 'resource-router-middleware';
import { getHashedConfigurator } from '../lib/marvelApiUtils';
import character from '../models/character';

const getRequestConfig = getHashedConfigurator('character');

export default ({ config, db }) =>
  resource({
    /** Property name to store preloaded entity on `request`. */
    id: 'character',

    /** For requests with an `id`, you can auto-load the entity.
     *  Errors terminate the request, success sets `req[id] = data`.
     */
    load(req, id, callback) {
      let character = character.find(character => character.id === id),
        err = character ? null : 'Not found';
      callback(err, character);
    },

    /** GET / - List all entities */
    index({ params }, res) {
      rp(getRequestConfig())
        .then(data => res.json(data))
        .catch(e => res.json([conf, e]));
    },

    /** POST / - Create a new entity */
    create({ body }, res) {
      body.id = character.length.toString(36);
      character.push(body);
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
      character.splice(character.indexOf(character), 1);
      res.sendStatus(204);
    },
  });
