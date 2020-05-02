//@flow

import { backupAll,saveRecord,createIndex,getAllIds, reIndex } from './rawFilesParser/RestService';
import { processFile } from './rawFilesParser/simpleParser';

//Backup

export function runBackupAll(api,tk) {
  backupAll(api,tk)
  .then((msg) => {console.log(msg)})
  .catch( (error) => {
    console.log(error);
  });
}

//File Import

export function runImportFile(file: string, api: string,tk: string) {
  let localSaveRecord = (record) => {
    return saveRecord(api, tk, record);
  };
  let localCreateIndex = () => {
    return createIndex(api, tk);
  };

  //Run import
  processFile(file, localSaveRecord)
    .then(function(){
      localCreateIndex()
    })
    .catch(function(err){
      console.error(err);
    });
}

//Re-Index

function recurviceReIndex(api,tk,ids){
  if(ids && ids.length > 0){
    reIndex(api,tk,ids[0])
    .then(() => {
      recurviceReIndex(api,tk,ids.slice(1));
    })
    .catch((error) => {
      console.log(error)
    });
  }
}

export function runReIndex(api,tk) {
  getAllIds(api,tk)
  .then((ids) => {
    recurviceReIndex(api,tk,ids);
  })
  .catch( (error) => {
    console.log("ERROR");
    console.log(error);
  });
}
