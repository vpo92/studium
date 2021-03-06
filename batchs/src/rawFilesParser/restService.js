import type { SaveRecordFunction } from './types';
import request from 'request';
import sleep from 'sleep';


const saveRecord =  (apiUrl, token, record) => {
  let uri = `${apiUrl}/prosopography`;
  console.log(`RestService.saveRecord ref ${record.reference} to ${uri}`);

  //Tempo : wait
  sleep.msleep(200);
  let auth = `Bearer ${token}`;

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
        if (!error && response.statusCode === 200) {
          //console.log(body) // Print the shortened url.
          resolve(body);
        }else{
          let msg = response.body.error ? response.body.error:JSON.stringify(response.body);
          reject("HTTP ERROR("+response.statusCode+"): "+msg);
        }
      }
    });
  });
};

const createIndex = (apiUrl, token) => {
  console.log(`RestService.createIndex`);
  let auth = `Bearer ${token}`;
  let uri = `${apiUrl}/admin/indexDB`;

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
        if (!error && response.statusCode === 200) {
          //console.log(body) // Print the shortened url.
          resolve(body);
        }else{
          reject("HTTP ERROR : "+response.statusCode);
        }
      }
    });
  });
};


const getAllIds = (apiUrl, token) => {
  console.log(`RestService.getAllIds`);
  let auth = `Bearer ${token}`;
  let uri = `${apiUrl}/admin/all-ids`;

  return new Promise((resolve, reject) => {
  request.get({
      uri: uri,
      headers: {'Content-Type': 'application/json','Authorization':auth},
      method: 'GET',
      json: true,
      body: {},
    }, function (error, response, body) {
      if(error){
        reject(error);
      }else{
        //console.log(response.statusCode);
        if (!error && response.statusCode === 200) {
          //console.log(body) // Print the shortened url.
          resolve(body);
        }else{
          reject("HTTP ERROR : "+response.statusCode);
        }
      }
    });
  });
};


const reIndex = (apiUrl, token, reference) => {

  let auth = `Bearer ${token}`;
  let uri = `${apiUrl}/admin/re-index-from-raw/${reference}`;
  console.log(`RestService.reIndex ref ${reference} to ${uri}`);

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
        if (!error && response.statusCode === 200) {
          //console.log(body) // Print the shortened url.
          resolve(body);
        }else{
          reject("HTTP ERROR : "+response.statusCode);
        }
      }
    });
  });
};


const reIndexManus = (apiUrl, token, reference) => {

  let auth = `Bearer ${token}`;
  let uri = `${apiUrl}/admin/re-index-manus/${reference}`;
  console.log(`RestService.reIndexManus ref ${reference} to ${uri}`);

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
        if (!error && response.statusCode === 200) {
          //console.log(body) // Print the shortened url.
          resolve(body);
        }else{
          reject("HTTP ERROR : "+response.statusCode);
        }
      }
    });
  });
};



const backupAll = (apiUrl, token) => {

  let auth = `Bearer ${token}`;
  let uri = `${apiUrl}/admin/backup/`;
  console.log(`RestService.backupAll`);

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
        if (!error && response.statusCode === 200) {
          //console.log(body) // Print the shortened url.
          resolve(body);
        }else{
          reject("HTTP ERROR : "+response.statusCode);
        }
      }
    });
  });
};


const createManuscrit =  (apiUrl, token, manuscrit) => {
  let uri = `${apiUrl}/manuscrit`;
  console.log(`RestService.createManuscrit ref ${manuscrit.Num} to ${uri}`);

  //Tempo : wait
  sleep.msleep(200);
  let auth = `Bearer ${token}`;

  return new Promise((resolve, reject) => {
    request.post({
        uri: uri,
        headers: {'Content-Type': 'application/json','Authorization':auth},
        method: 'POST',
        json: true,
        body: manuscrit,
      }, function (error, response, body) {
        if(error){
          reject(error);
        }else{
          //console.log(response.statusCode);
          if (!error && response.statusCode === 200) {
            //console.log(body) // Print the shortened url.
            resolve(body);
          }else{
            let msg = response.body.error ? response.body.error:JSON.stringify(response.body);
            reject("HTTP ERROR("+response.statusCode+"): "+msg);
          }
        }
      });
  });
};

const importManuscritList =  (apiUrl, token, manuscritList) => {
  let uri = `${apiUrl}/manuscrit/list`;
  console.log('RestService.createManuscritList'+uri);

  //Tempo : wait
  sleep.msleep(200);
  let auth = `Bearer ${token}`;

  return new Promise((resolve, reject) => {
    request.post({
        uri: uri,
        headers: {'Content-Type': 'application/json','Authorization':auth},
        method: 'POST',
        json: true,
        body: manuscritList,
      }, function (error, response, body) {
        if(error){
          reject(error);
        }else{
          //console.log(response.statusCode);
          if (!error && response.statusCode === 200) {
            //console.log(body) // Print the shortened url.
            resolve(body);
          }else{
            let msg = response.body.error ? response.body.error:JSON.stringify(response.body);
            reject("HTTP ERROR("+response.statusCode+"): "+msg);
          }
        }
      });
  });
};


const auth = (apiUrl, username, password) => {



  let uri = `${apiUrl}/auth/login`;
  console.log(`RestService.auth for user ${username}`);

  return new Promise((resolve, reject) => {

    if(username == null || username =="" || username == ''){
      reject("ERROR on auth : username not provided");
    }else if(password == null || password =="" || password == ''){
      reject("ERROR on auth : password not provided");
    }else{
        request.post({
            uri: uri,
            headers: {'Content-Type': 'application/json'},
            method: 'POST',
            json: true,
            body: {
              email:username,
              password:password
            },
          }, function (error, response, body) {
            if(error){
              reject(error);
            }else{
              //console.log(response.statusCode);
              if (!error && response.statusCode === 200) {
                resolve(body.token);
              }else{
                reject("HTTP ERROR : "+response.statusCode);
              }
            }
          });
    }
  });
};

const indexDB = (apiUrl, token) => {
  console.log(`RestService.indexDB`);
  let auth = `Bearer ${token}`;
  let uri = `${apiUrl}/admin/indexDB`;

  return new Promise((resolve, reject) => {
  request.post({
      uri: uri,
      headers: {'Authorization':auth},
      method: 'POST',
      json: true,
      body: {},
    }, function (error, response, body) {
      if(error){
        reject(error);
      }else{
        //console.log(response.statusCode);
        if (!error && response.statusCode === 200) {
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
  saveRecord, createIndex, getAllIds, reIndex, reIndexManus, backupAll, auth, indexDB, createManuscrit, importManuscritList
};
