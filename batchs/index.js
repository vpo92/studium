#!/usr/bin/env babel-node

import { auth } from './src/rawFilesParser/restService.js';
import { runBackupAll,runReIndex,runImportFile } from './src/studium.cli.js';
let argv = require('minimist')(process.argv.slice(2));

async function main(){
  if(argv && argv._ && argv._[0]){
    let command = argv._[0];
    let host = argv.host;
    let username = argv.username;
    let password = argv.password;
    let token = null;
    try{
      switch(command){
        case 'auth':{
          console.log("Studium CLI : auth");
          token = await auth(host,username,password);
          console.log(token);
          break;
        }
        case 're-index':{
          console.log("Studium CLI : re-index");
          token = await auth(host,username,password);
          runReIndex(host,token);
          break;
        }
        case 'import-file':{
          console.log("Studium CLI : import-file");
          let file = argv.file;
          token = await auth(host,username,password);
          runImportFile(file,host,token);
          break;
        }
        case 'backup':{
          console.log("Studium CLI : backup");
          token = await auth(host,username,password);
          runBackupAll(host,token);
          break;
        }
        default:{
          console.log("ERROR : no such command "+command);
        }
      }
    }catch(error){
      console.log(error);
    }
  }else{
    console.log("ERROR : no command provided");
  }
}

main(argv);
