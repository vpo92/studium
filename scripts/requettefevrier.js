//mongo --quiet studium csvexport.js > export.csv
/*
print("reference,title");
db.prosopography.find().forEach(function(p){
  print(p.reference+","+p.title);
});
*/

//print("reference,title,relationalInsertion,ecclesiasticalCarrer,professionalCareer");

var t = [];
db.prosopography.find().forEach(function(p){

  if(p.relationalInsertion || p.ecclesiasticalCarrer || p.professionalCareer){
    var r = {
      reference: p.reference,
      title: p.title,
      relationalInsertion: p.relationalInsertion,
      ecclesiasticalCarrer: p.ecclesiasticalCarrer,
      professionalCareer: p.professionalCareer
    };
    //print("{ reference:'"+p.reference+", title:"+p.title+",");
    //print("relationalInsertion:"+JSON.stringify(p.relationalInsertion)+",");
    //print("ecclesiasticalCarrer:"+JSON.stringify(p.ecclesiasticalCarrer)+",");
    //print("professionalCareer:"+JSON.stringify(p.professionalCareer)+"},");
    t.push(r);
  }
});
print(JSON.stringify(t));
