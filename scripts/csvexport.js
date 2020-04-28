//mongo --quiet studium csvexport.js > export.csv
print("reference,title");
db.prosopography.find().forEach(function(p){
  print(p.reference+","+p.title);
});
