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
  },
  createIndex :  function(db){
    return new Promise(function (resolve,reject){
      if(db){
        db.collection("prosopography").createIndex({"identity.name.value":"text"}, function (error, results) {
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
  },
}
