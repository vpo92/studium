
import { Parser,  transforms } from 'json2csv';
import logger from './logger';

/**
convert jsonDATA to CSV and send it threw response
*/
function sendCSVFile(response,jsonData,title){
  logger.info("sendCSVFile");
  const parser = new Parser({ transforms: [ transforms.flatten({ objects: true, arrays: true })] });
  const csv = parser.parse(jsonData);
  response.header('Content-Type', 'text/csv');
  response.header('Content-disposition', 'attachment; filename='+title+'.csv');
  response.send(csv);
}

/**
convert jsonDATA to jpg TXT File and send it threw response
*/
function sendTXTFile(response, jsonData, title){
  logger.info("sendTXTFile");

  response.writeHead(200, {
                     "Content-Type": "text/plain",
                     "Content-disposition": "attachment; filename="+title+".txt"
 });
 let count = jsonData.length;
  for(var i=0; i < count; i++){
    let p = jsonData[i];
    //logger.info(p.raw.length);
    for(var j in p.raw){
      let line = p.raw[j];
      //logger.info(line);
      response.write(line+"\n");

      if(i == count-1 && j == (p.raw.length-1)){
        response.end(line);
      }

    }



  }

}


module.exports = {
  sendCSVFile,
  sendTXTFile,
};
