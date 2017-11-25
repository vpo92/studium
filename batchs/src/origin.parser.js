const UtilParser = require('./util.parser');

/**

        Origin:
          type: object
          properties:
            birthPlace:
              $ref: '#/definitions/SimpleInformation'
            diosese:
              $ref: '#/definitions/SimpleInformation'
            movesInOutParis:
              type: array
              items:
                $ref: '#/definitions/SimpleInformation'

*/

class OriginParser{

  static parsePlace(json){
    let res = null;
    if(json){
      if(json.place){
        if(typeof json.place === 'string'){
          res = {"value":json.place};
        }else if(json.place instanceof Array){
          let val = json.place.filter(item =>(typeof item === 'string'));
          res = {"value":val.join(" ")};
        }
      }
    }
    return res;
  }

  static parseDiocese(data){
    let res = null;
    if(data){
      if(typeof data === "string"){
        res = {"value":data};
      }else{
        if(data.content){
          let s = data.content[0];
          if(data.ptitle){
            s += " "+data.ptitle.content;
          }
          res = {'value':s};
        }
      }
    }
    return res;
  }

  static buildOrigin(json){
    if(json){
      let origin = {};

      let birthPlace = UtilParser.findProperty(json,"prosop.person.geo-origin.birthplace.data");
      if(birthPlace){
        origin.birthPlace = OriginParser.parsePlace(birthPlace);
      }

      let diocese = UtilParser.findProperty(json,"prosop.person.geo-origin.diocese.data");
      if(diocese){
        origin.diocese = OriginParser.parseDiocese(diocese);
      }

      //FIXME : movesInOutParis

      return origin;
    }else{
      return null;
    }
  }

}

module.exports = OriginParser;
