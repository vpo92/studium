// @flow

import { MongoClient } from 'mongodb';
const bluebird = require('bluebird');
const mongo = bluebird.promisifyAll(MongoClient);

let state = {
  connection: null,
};

type Callback = (err?: Error) => void;

function connect(url: string, done: Callback): void {
  if (state.connection) {
    return done();
  } else {
    MongoClient.connect(url, (err, connection) => {
      if (err) {
        return done(err);
      }
      state.connection = connection;
      return done();
    });
  }
}

async function connectAsync(url: string): Promise<MongoClient>{
  if (state.connection) {
    return state.connection;
  } else {
      state.connection = await mongo.connectAsync(url);
  }
}

function get(): any {
  return state.connection;
}

function close(done: Callback): void {
  if (state.connection) {
    state.connection.close(err => {
      state.connection = null;
      state.mode = null;
      done(err);
    });
  }
}


module.exports = {
  connect,
  get,
  close,
  connectAsync,
};
