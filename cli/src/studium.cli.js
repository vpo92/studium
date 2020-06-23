//@flow

import chalk from 'chalk';
import { backupAll,saveRecord,createIndex,getAllIds, reIndex, indexDB } from './rest.service';
import { processFile } from '../../batchs/src/rawFilesParser/simpleParser';

//Backup

export function runBackupAll(api: string,tk: string) {
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
function recurviceReIndex(api: string, tk: string, ids: [string]){
  if(ids && ids.length > 0){
    if(ids[0]){
      reIndex(api,tk,ids[0])
      .then(() => {
        recurviceReIndex(api,tk,ids.slice(1));
      })
      .catch((error) => {
        console.log(error)
      });
    }else{
      recurviceReIndex(api,tk,ids.slice(1));
    }
  }
}

export function runReIndex(api: string, tk: string) {
  getAllIds(api,tk)
  .then((ids) => {
    recurviceReIndex(api,tk,ids);
  })
  .catch( (error) => {
    console.log("ERROR");
    console.log(error);
  });
}

export function runIndexDB(api: string, tk: string) {
  indexDB(api,tk)
  .then((res) => {
    console.log(res);
  })
  .catch( (error) => {
    console.log("ERROR");
    console.log(error);
  });
}

export function version(){
  const packageJson = require('../package.json');
  console.log("Studium CLI v"+packageJson.version);
}

export function help(){
  version();
  const menus = {
    main: `
${chalk.green('studium [command] <options>')}
    ${chalk.blue('auth')} ............... auth to API and get token
    ${chalk.blue('backup')} ............. backup prosopography data
    ${chalk.blue('import-file')}......... import raw file in JPG format
    ${chalk.blue('re-index')}............ re-index all prosopography from raw
    ${chalk.blue('update-db-index')}..... update mongodb text index for search
    ${chalk.blue('version')} ............ show package version
    ${chalk.blue('help')} ............... show help menu for a command

    ${chalk.cyan('--host')} ............. studium api host in format http://mydomain.com
    ${chalk.cyan('--username')} ......... username used to log in
    ${chalk.cyan('--password')} ......... password used to log in
    ${chalk.cyan('--file')} ............. import file path
  `,

    auth: `//...
          `,
    forecast: `//...
          `,
    config: `//...
          `,
  };
  console.log(menus.main)
}
