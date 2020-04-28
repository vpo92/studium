//mongo --quiet studium doublons.js > doublon.csv
print("reference,title,count");
db.prosopography.aggregate( [
   { $group: { _id: {reference:"$reference",title:"$title"},
   //{ $group: { _id: {reference:"$reference"},
               count: { $sum: 1 } } },
   { $match: { count: { $gt: 1 } } },
   { $project: { _id: 0,
                 reference: "$_id.reference",
                 title: "$_id.title",
                 count: 1}},
   { $sort: {title: 1}}
] )
.forEach(function(r){
  print(r.reference+","+r.count+","+r.title);
});
