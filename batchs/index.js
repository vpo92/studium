#!/usr/bin/env babel-node

import { cliAuth as auth, help, version,runBackupAll,runReIndex,runReIndexManus,runReIndexManusById, runImportFile, runIndexDB, runImportJsonFile, runImportManusFromFile, runCreateAdmin } from './src/studium.cli.js';
let argv = require('minimist')(process.argv.slice(2));

async function main(){

  let command = null;
  if (argv.version || argv.v) {
    command = 'version';
  }

  if (argv.help || argv.h) {
    command = 'help';
  }

  if(command || (argv && argv._ && argv._[0])){
    if(!command){
      command = argv._[0];
      command = command.trim();
    }

    let host = argv.host;
    let username = argv.username;
    let password = argv.password;
    let reference = argv.id;
    let tokenName = "tk";
    let token = null;
    try{
      switch(command){
        case 'auth':{
          console.log("Studium CLI : auth");
          token = await auth(host,username,password,tokenName);
          console.log(token);
          break;
        }
        case 're-index':{
          console.log("Studium CLI : re-index");
          token = await auth(host,username,password,tokenName);
          runReIndex(host,token);
          break;
        }
        case 're-index-manus':{
          console.log("Studium CLI : re-index-manus");
          token = await auth(host,username,password,tokenName);
          if(reference){
            runReIndexManusById(host,reference,token);
          }else{
            runReIndexManus(host,token);
          }

          break;
        }
        case 'import-file':{
          console.log("Studium CLI : import-file");
          let file = argv.file;
          token = await auth(host,username,password,tokenName);
          runImportFile(file,host,token);
          break;
        }
        case 'import-manuscrit':{
          console.log("Studium CLI : import-manuscrit");
          let file = argv.file;
          token = await auth(host,username,password,tokenName);
          await runImportManusFromFile(host,token,file);
          break;
        }
        case 'backup':{
          console.log("Studium CLI : backup");
          token = await auth(host,username,password,tokenName);
          runBackupAll(host,token);
          break;
        }
        case 'update-db-index':{
          console.log("Studium CLI : update-db-index");
          token = await auth(host,username,password,tokenName);
          runIndexDB(host,token);
          break;
        }
        case 'import-json-file':{
          console.log("Studium CLI : import-json-file");
          let file = argv.file;
          let collection = argv.collection;
          //token = await auth(host,username,password);
          //runIndexDB(host,token);
          const dbUrl = 'mongodb://localhost/studium';
          runImportJsonFile(file,dbUrl,collection);
          break;
        }
        case 'create-admin':{
          console.log("Studium CLI : create-admin");
          runCreateAdmin("administrator","admin@studium.dev","pass","mongodb://localhost/studium");
          break;
        }
        case 'help':{
          help();
          break;
        }
        case 'version':{
          version();
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
