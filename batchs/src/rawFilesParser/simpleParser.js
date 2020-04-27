import readline from 'readline';
import fs from 'fs';
import {detectDates} from './util/date.parser';
import {detectNames} from './util/name.parser';
import {detectPlaces} from './util/place.parser';
import {detectTitles} from './util/title.parser';
import {detectInstitutions} from './util/institution.parser';
import {isComment} from './util/comment.parser';
import {isLink} from './util/comment.parser';
import {getDataLineNameByCode, getOpusLineNameByCode,getVersionLineNameByCode} from './util/para.parser';
import {finalyzeProsopography,finalyzeOpus} from './util/special.prop.parser';

/**
Detecte le type de ligne en cours d'analyse
*/
function detectTypeOfLine(line){
  /**if(line.match(/^<[a-zA-Z0-9\.]+>[ \t]+\//g)){
    return 'COMMENTAIRE';
  }else */
  if(line.match(/^<<<[a-zA-Z0-9\.]+>>>/g)){
    return 'VERSION_DATA';
  }else if(line.match(/^<<k[a-zA-Z0-9\.]+a[a-zA-Z0-9\.]+>>/g)){
    return 'NEW_VERSION';
  }else if(line.match(/^<<[a-zA-Z0-9\.]+>>/g)){
    return 'OPUS_DATA';
  }else if(line.match(/^<1a>/g)){
    return 'NEW_PROSO';
  }else if(line.match(/^<r>/g)){
    return 'REFERENCE';
  }else if(line.match(/^<[a-zA-Z0-9\.]+a[a-zA-Z0-9\.]+>/g)){
    return 'NEW_OPUS';
  }else if(line.match(/^</g)){
    return 'DATA';
  }else if(line.match(/^C/g)){
    return 'BIBLIOGRAPHY_START';
  }else if(line.match(/^$/g)){
    return 'EMPTY';
  }else{
    return 'ERROR';
  }
}

function getLineInformations(line){
  const regex = /^<<?<?([a-zA-Z0-9\.]*)>>?>?(.*)/g;
  let t=null;
  if((t =regex.exec(line))){
    return {
      code:t[1],
      data:t[2],
    };
  }else{
    return null;
  }
}

function getOpusLineInformations(line){
  let info = getLineInformations(line);
  if(info.code){
    //Si premiere ligne, on parse pour avoir le type de livre
    const regexOpus = /^([0-9]+)([a-z]+)([0-9]+)/g;
    const t = regexOpus.exec(info.code);
    if(t){
      return {
        code:t[2],
        data: info.data,
      }
      //Sinon on utilise le code en retirant un eventuel chiffre inutile
    }else{
      const regex = /^([a-z]+).*/g;
      const t = regex.exec(info.code);
      return {
        code: t[1],
        data: info.data,
      }
    }

  }else{
    return null;
  }
}


function getVersionLineInformations(line){
  let info = getLineInformations(line);
  if(info.code){
    //Si premiere ligne, on parse pour avoir le type de version
    const regex = /^(k[0-9]+)([a-z]+)([0-9]+)/g;
    const t = regex.exec(info.code);
    if(t){
      return {
        code:t[1],
        data: info.data,
      }
      //Sinon on utilise le code en retirant un eventuel chiffre inutile
    }else{
      const regex = /^([a-z]+).*/g;
      const t = regex.exec(info.code);
      return {
        code: t[1],
        data: info.data,
      }
    }

  }else{
    return null;
  }
}

function formatData(data){
  return data.trim();
}

function getMeta(data){
  return {
      dates: detectDates(data),
      names: detectNames(data),
      places: detectPlaces(data),
      titles: detectTitles(data),
      institutions: detectInstitutions(data),
      isComment: isComment(data),
      isLink: isLink(data),
  };
}

function buildDataLine(ctx,line){
  let info = getLineInformations(line);
  //Si mm data
  if(ctx.currentData && ctx.currentData.code === info.code){
    ctx.currentData.data.push({
        value: formatData(info.data),
        meta: getMeta(info.data),
      });
  }else{
    //Si nouvelle data avec data existante
    //On enregistre la data et on en crée une nouvelle
    if(ctx.currentData){
      ctx.currentRecord[ctx.currentData.name] = ctx.currentData.data;
    }
    //Traitement nouvelle donnée
    ctx.currentData = {
      code: info.code,
      name: getDataLineNameByCode(info.code),
      data: [{
          value: formatData(info.data),
          meta: getMeta(info.data),
        },
      ],
    }
  }
  return ctx;
}

function buildOpusLine(ctx,line){

  let info = getOpusLineInformations(line);
  //Si mm data
  if(ctx.currentOpusData && ctx.currentOpusData.code === info.code){
    ctx.currentOpusData.data.push({
        value: formatData(info.data),
        meta: getMeta(info.data),
      });
  }else{
    //Si nouvelle data avec data existante
    //On enregistre la data et on en crée une nouvelle
    if(ctx.currentOpusData){
      ctx.currentOpus[ctx.currentOpusData.name] = ctx.currentOpusData.data;
    }
    //Traitement nouvelle donnée
    ctx.currentOpusData = {
      code: info.code,
      name: getOpusLineNameByCode(info.code),
      data: [{
          value: formatData(info.data),
          meta: getMeta(info.data),
        },
      ],
    }
  }
  return ctx;
}
//FIXME : TODO
//TODO
function buildVersionLine(ctx,line){
  let info = getVersionLineInformations(line);
  //Si mm data
  if(ctx.currentVersionData && ctx.currentVersionData.code === info.code){
    ctx.currentVersionData.data.push({
        value: formatData(info.data),
        meta: getMeta(info.data),
      });
  }else{
    //Si nouvelle data avec data existante
    //On enregistre la data et on en crée une nouvelle
    if(ctx.currentVersionData){
      ctx.currentVersion[ctx.currentVersionData.name] = ctx.currentVersionData.data;
    }
    //Traitement nouvelle donnée
    ctx.currentVersionData = {
      code: info.code,
      name: getVersionLineNameByCode(info.code),
      data: [{
          value: formatData(info.data),
          meta: getMeta(info.data),
        },
      ],
    }
  }
  return ctx;
}

function buildCommentaire(line){

}

function buildReference(ctx,line){

  let info = getLineInformations(line);

  //Si currentVersionData, on ajoute la reference a la currentVersionData
  if(ctx.currentVersionData){
    if(!ctx.currentVersionData.data.reference){
      ctx.currentVersionData.data.reference = [];
    }
    ctx.currentVersionData.data.reference.push(info.data);
  //Si currentOpusData, on ajoute la reference a la currentOpusData
  }
  else if(ctx.currentOpusData){
    if(!ctx.currentOpusData.data.reference){
      ctx.currentOpusData.data.reference = [];
    }
    ctx.currentOpusData.data.reference.push(info.data);
  //Si currentData, on ajoute la reference a la currentData
  }else if(ctx.currentData){
    if(!ctx.currentData.data.reference){
      ctx.currentData.data.reference = [];
    }
    ctx.currentData.data.reference.push(info.data);
  }

  return ctx;
}


function startProso(ctx){
  ctx.currentRecord = {};
  ctx.currentData = null;
  ctx.currentOpus = null;
  ctx.currentOpusData = null;
  ctx.currentVersion = null;
  ctx.currentVersionData = null;
  ctx.currentRecordRaw = [];
  ctx.recordCount = ctx.recordCount+1;
  return ctx;
}

function startOpus(ctx){
  if(ctx.currentData){
    let idx = ctx.currentData.data.length - 1;
    if(! (ctx.currentData.data[idx] && ctx.currentData.data[idx].opus)){
      ctx.currentData.data[idx].opus = [];
    }
  }
  ctx.currentOpus = {};
  ctx.currentOpusData=null;
  return ctx;
}

function startVersion(ctx){
  if(ctx.currentOpus){
    if(!ctx.currentOpus.versions){
      ctx.currentOpus.versions = [];
    }
  }
  ctx.currentVersion = {};
  ctx.currentVersionData=null;
  return ctx;
}

function endProso(ctx,saveRecord){
  //FIXME
  if(ctx.currentRecord){
    if(ctx.currentData){
      ctx.currentRecord[ctx.currentData.name] = ctx.currentData.data;
    }
    try{
      ctx.currentRecord = finalyzeProsopography(ctx.currentRecord);
    }catch(e){
      console.log("ERROR finalyzeProsopography:"+e);
    }
    ctx.currentRecord.raw = ctx.currentRecordRaw;
    let saveR = ctx.currentRecord;
    //console.log(ctx.currentRecord);
    //FIXME : SAVE
    ctx.currentRecord = null;
    ctx.currentRecordRaw = null;
    saveRecord(saveR)
    .catch( (error) => {
      throw Error("ERROR on record "+saveR.reference+" : "+error);
    });
  }

  return ctx;
}

function endOpus(ctx){
  if(ctx.currentOpus){
    //Ajoute l'opus à la data en cours
    if(ctx.currentOpusData){
      ctx.currentOpus[ctx.currentOpusData.name] = ctx.currentOpusData.data;
    }
    ctx.currentOpus = finalyzeOpus(ctx.currentOpus);
    if(ctx.currentData && ctx.currentData.data){
      let idx = ctx.currentData.data.length - 1;
      if(ctx.currentData.data[idx] && ctx.currentData.data[idx].opus){
        ctx.currentData.data[idx].opus.push(ctx.currentOpus);
      }
    }
  }
  ctx.currentOpus = null;
  return ctx;
}

function endVersion(ctx){
  if(ctx.currentVersion){
    //Ajoute l'opus à la data en cours
    if(ctx.currentVersionData){
      ctx.currentVersion[ctx.currentVersionData.name] = ctx.currentVersionData.data;
    }
    if(ctx.currentOpus && ctx.currentOpus.versions){
      ctx.currentOpus.versions.push(ctx.currentVersion);
    }
  }
  ctx.currentVersion = null;
  return ctx;
}

export function processStream(stream, saveRecord){
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface(stream);
    try{

      let ctx = {
        currentRecord : null,
        currentRecordRaw : null,
        currentData : null,
        currentOpus : null,
        currentOpusData : null,
        currentVersion : null,
        currentVersionData : null,
        currentLine:1,
        recordCount: 0,
      };

      rl.on('line', (line) => {
        try{
          let type = detectTypeOfLine(line);
          //console.log(type);
          switch(type){
            case 'REFERENCE':
              //Traite la ligne de reference
              ctx = buildReference(ctx,line);
              break;
            case 'COMMENTAIRE':
            //TODO commentaires
              break;
            case 'VERSION_DATA':
              ctx = buildVersionLine(ctx,line);
              break;
            case 'NEW_VERSION':
              //Finalise la version en cours
              ctx = endVersion(ctx);
              //Créé une nouvelle version
              ctx = startVersion(ctx);
              //Traite la ligne de version
              ctx = buildVersionLine(ctx,line);
              break;
            case 'OPUS_DATA':
              //Finalise la version en cours
              ctx = endVersion(ctx);
              //Traite la ligne d'opus
              ctx = buildOpusLine(ctx,line);
              break;
            case 'NEW_PROSO':
              //Finalise la version en cours
              ctx = endVersion(ctx);
              //Finalise l opus en cours
              ctx = endOpus(ctx);
              //Finalise la proso en cours
              ctx = endProso(ctx,saveRecord);
              //Créé une nouvelle proso
              ctx = startProso(ctx);
              //Traite la ligne de donnee
              ctx = buildDataLine(ctx,line);
              break;
            case 'NEW_OPUS':
              //Finalise la version en cours
              ctx = endVersion(ctx);
              //Finalise l opus en cours
              ctx = endOpus(ctx);
              //Créé un nouvel opus
              ctx = startOpus(ctx);
              //Traite la ligne d'opus
              ctx = buildOpusLine(ctx,line);
              break;
            case 'DATA':
              //Finalise la version en cours
              ctx = endVersion(ctx);
              //Finalise l opus en cours
              ctx = endOpus(ctx);
              //Traite la ligne de donnee
              ctx = buildDataLine(ctx,line);
              break;
            default:
              //console.log(type);
          }
          if(ctx.currentRecordRaw){
            ctx.currentRecordRaw.push(line);
          }
        }catch(e){

          console.log("ERROR PARSING LINE "+ctx.currentLine);
          //console.log(ctx);
          //console.log(e);
        }

        ctx.currentLine++;
      });

      rl.on('close', () => {
        try{
          //Finalise la version en cours
          ctx = endVersion(ctx);
          //Finalise l opus en cours
          ctx = endOpus(ctx);
          //Finalise la proso en cours
          ctx = endProso(ctx,saveRecord);
        }catch(e){
          console.log("ERROR PARSING LINE "+ctx.currentLine);
          //console.log(ctx);
          //console.log(e.message);
        }
        console.log("END OF FILE. Nb ELEM: "+ctx.recordCount);
        resolve();
      });

    }catch(e){
      console.log("ERROR PARSING LINE "+ctx.currentLine);
      reject(e);
    }
  });
}

export async function processFile(inputFile, saveRecord){
  const instream = fs.createReadStream(inputFile);
  return processStream(instream, saveRecord);
}
