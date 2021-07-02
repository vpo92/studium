//@flow

import chalk from 'chalk';
import fs from 'fs';;
import { auth, backupAll,saveRecord,createIndex,getAllIds, reIndex, reIndexManus, indexDB } from './rawFilesParser/RestService';
import { processFile } from './rawFilesParser/simpleParser';
import { importJsonFile } from './fileImporter/fileImport';
import { createManuscrit, importManuscritList } from './rawFilesParser/restService';


//Auth
export async function cliAuth(host,username,password,file){
  console.log(`Studium CLI auth ${file}`);
  if(fs.existsSync(file)){
    const tk = fs.readFileSync(file,'utf8');
    return tk;
  }else{
    console.log(`No Local Token found`);
    const tk = await auth(host,username,password);
    fs.writeFileSync(file,tk)
    return tk;
  }
}

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


function recurciveReIndexManus(api,tk,ids){
  if(ids && ids.length > 0){
    if(ids[0]){
      reIndexManus(api,tk,ids[0])
      .then(() => {
        recurciveReIndexManus(api,tk,ids.slice(1));
      })
      .catch((error) => {
        console.log(error)
      });
    }else{
      recurciveReIndexManus(api,tk,ids.slice(1));
    }
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

export function runReIndexManus(api,tk) {
  getAllIds(api,tk)
  .then((ids) => {
    recurciveReIndexManus(api,tk,ids);
  })
  .catch( (error) => {
    console.log("ERROR");
    console.log(error);
  });
}

export function runIndexDB(api,tk) {
  indexDB(api,tk)
  .then((res) => {
    console.log(res);
  })
  .catch( (error) => {
    console.log("ERROR");
    console.log(error);
  });
}

export function runImportJsonFile(file, dbUrl, collection) {
  importJsonFile(file,dbUrl,collection);
}

export async function runImportManusFromFile(apiUrl, tk, file){
  console.log(`runImportManusFromFile will process file ${file}`);
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      throw err;
    }else{
      const json = JSON.parse(data);
      console.log('Will import '+json.length+' manuscrits');
      importManuscritList(apiUrl, tk, json)
        .catch( (error) => {
          console.log("ERROR runImportManusFromFile");
          console.log(JSON.stringify(error));
        });
    }
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
    ${chalk.blue('import-file')}......... import raw TXT file in JPG format
    ${chalk.blue('re-index')}............ re-index all prosopography from raw
    ${chalk.blue('re-index-manus')}...... re-index manus info
    ${chalk.blue('update-db-index')}..... update mongodb text index for search
    ${chalk.blue('import-manuscrit')}.... import manuscrit from file
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

//${chalk.blue('import-json-file')}.... import csv file to mongoDB
