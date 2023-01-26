
async function createFile(fileName,content){
  return true;
}

async function listFile(dirName){
  return [];
}

async function removeFile(fileName){
  return true;
}


/** *********************
 * Export               *
 ************************
 */
module.exports = {
  createFile,
  listFile,
  removeFile
};
