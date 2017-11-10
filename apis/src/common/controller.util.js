exports.handleData = (res) => {
  return function(data){
    res.statusCode = 200;
    res.json(data);
  }
}

exports.handleError = (res) => {
  return function(error){
    res.statusCode = 500;
    res.json({"error":error});
  }
}
