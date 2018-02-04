// @flow

import { MongoClient } from 'mongodb';

let state = {
  db: null,
};

type Callback = (err?: Error) => void;

function connect(url: string, done: Callback): void {
  if (state.db) {
    return done();
  } else {
    MongoClient.connect(url, (err, db) => {
      if (err) {
        return done(err);
      }
      state.db = db;
      return done();
    });
  }
}

function get(): any {
  return state.db;
}

function close(done: Callback): void {
  if (state.db) {
    state.db.close(err => {
      state.db = null;
      state.mode = null;
      done(err);
    });
  }
}

module.exports = {
  connect,
  get,
  close,
};
