// @flow

import type { SaveRecordFunction } from './types';
import request from 'request';


const saveRecord: SaveRecordFunction =  (apiUrl, token, record) => {
  console.log(`RestService.saveRecord ref ${record.reference}: Saving record.`);
  let auth = `Bearer ${token}`;
  let uri = `${apiUrl}/prosopography`;

  return new Promise((resolve, reject) => {
  request.post({
      uri: uri,
      headers: {'Content-Type': 'application/json','Authorization':auth},
      method: 'POST',
      json: true,
      body: record,
    }, function (error, response, body) {
      if(error){
        reject(error);
      }else{
        //console.log(response.statusCode);
        if (!error && response.statusCode == 200) {
          //console.log(body) // Print the shortened url.
          resolve(body);
        }else{
          reject("HTTP ERROR : "+response.statusCode);
        }
      }
    });
  });
};

const createIndex = (apiUrl, token) => {
  console.log(`RestService.createIndex`);
  let auth = `Bearer ${token}`;
  let uri = `${apiUrl}/prosopography/indexDB`;

  return new Promise((resolve, reject) => {
  request.post({
      uri: uri,
      headers: {'Content-Type': 'application/json','Authorization':auth},
      method: 'POST',
      json: true,
      body: {},
    }, function (error, response, body) {
      if(error){
        reject(error);
      }else{
        //console.log(response.statusCode);
        if (!error && response.statusCode == 200) {
          //console.log(body) // Print the shortened url.
          resolve(body);
        }else{
          reject("HTTP ERROR : "+response.statusCode);
        }
      }
    });
  });

};

export {
  saveRecord, createIndex
};
