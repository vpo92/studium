import { MongoClient } from 'mongodb';

let state = {
  db: null,
};

function connect(url, done) {
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

function get() {
  return state.db;
}

function close(done) {
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
