class UtilParser{

  static findProperty(json, propertyName){
    if(json && propertyName){
      let props = propertyName.split('.');
      if(json[props[0]]){
        if(props.length === 1){
          return json[propertyName];
        }else{
          return UtilParser.findProperty(json[props[0]],props.slice(1).join('.'));
        }
      }else{
        return null;
      }
    }else{
      return null;
    }
  }
}

module.exports = UtilParser;
