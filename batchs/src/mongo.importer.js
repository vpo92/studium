module.exports = {
  importProsopography : function(db,item){
    console.log("importProsopography");
    return new Promise(function (resolve,reject){
      if(db && item){
        db.collection("prosopography").insert(item, null, function (error, results) {
            if (error){
             reject(error);
           }else{
             resolve(results);
           }
        });
      }else{
        console.log("rejection");
        reject("missing params");
      }
    });
  }
}



/**

var connectMongo = () =>{
  return new Promise(function (resolve,reject){
    MongoClient.connect("mongodb://localhost/studium", function(error, db) {
        if (error){
          reject(error);
        }
        resolve(db);
    });
  });
}

var saveProsopographyToMongo = (db,item) =>{
  return new Promise(function (resolve,reject){
    db.collection("prosopography").insert(item, null, function (error, results) {
        if (error){
         reject(error);
       }else{
         resolve(results);
       }
    });
  });
}
*/
