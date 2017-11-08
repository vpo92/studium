class IndentityParser{

  static findProperty(json, propertyName){
    //console.log("findProperty"+JSON.stringify(json)+":"+propertyName);
    if(json && propertyName){
      var props = propertyName.split('.');
      if(json[props[0]]){
        if(props.length == 1){
          return json[propertyName];
        }else{
          return IndentityParser.findProperty(json[props[0]],props.slice(1).join('.'));
        }
      }else{
        return null;
      }
    }else{
      return null;
    }
  }

  static parseDates(json){
    var res = null;
    if(json){
      if(json.dates){
        res = {
          'from': json.dates.fromDate.date.content?(json.dates.fromDate.date.content).toString():"%",
          'to': json.dates.toDate.date.content?(json.dates.toDate.date.content).toString():"%"
        };
      }else if(typeof json == "string"){
        res = {
          'from': json.split('-')[0].trim(),
          'to': json.split('-')[1].trim()
        };
      }
    }
    return res;
  }

  static parseName(json){
    var res = null;
    if(json){
      if(typeof json == "string"){
        res = {'value':json};
      }else{
        if(IndentityParser.findProperty(json,"pname.content")){
          res = {'value':json.pname.content};
        }
      }
    }
    return res;
  }

  static parseNameVariant(json){
    var res = null;
    if(json){
      if(json instanceof Array){
        res = json.map( item => {
          if(item.data){
            return IndentityParser.parseName(item.data); // {'value':item.data.pname.content});
          }
        });
      }else{
        if(json.data){
          res = [IndentityParser.parseName(json.data)];
        }
      }
    }
    return res;
  }

  static buildReference(json){
    return IndentityParser.findProperty(json,"prosop.person.label.personID.data");
  }

  static buildIdentity(json){
    if(json){
      var identity = {};
      var name = IndentityParser.findProperty(json,"prosop.person.label.usage-name.data");
      if(name){
        identity.name = {'value':name};
      }

      var nameVariant = IndentityParser.findProperty(json,"prosop.person.label.variant-name");
      if(nameVariant){
        identity.nameVariant = IndentityParser.parseNameVariant(nameVariant);
      }

      var description =  IndentityParser.findProperty(json,"prosop.person.label.description.data");
      if(description){
        identity.description = {'value':description};
      }

      var datesOfLife = IndentityParser.findProperty(json,"prosop.person.label.datesOfLife.data");
      if(datesOfLife){
        identity.datesOfLife = IndentityParser.parseDates(datesOfLife);
      }

      var datesOfActivity = IndentityParser.findProperty(json,"prosop.person.label.datesOfActivity.data");
      if(datesOfActivity){
        identity.datesOfActivity = IndentityParser.parseDates(datesOfActivity);
      }

      //FIXME data source for mapping of activityMediane: ???
      //donnee calcule : milieu des deux date d'activite et arrondi superieur
      //FIXME data source for mapping of gender ???
      //si rien, c'est un homme, sinon f c(est une femme. paragraphe 1h)
      //ada margarita ... fiche n°16
      console.log(IndentityParser.findProperty(json,"prosop.person.label"));
      var gender =  IndentityParser.findProperty(json,"prosop.person.label.sex.data")?"female":"male";
      identity.gender = {'value':gender};

      var status =  IndentityParser.findProperty(json,"prosop.person.label.statut.data");
      if(status){
        switch (status) {
          case 'Extérieur':
            status = 'external';
            break;
          case 'Maitre':
            status = 'master';
            break;
          case 'Étudiant':
            status = 'student';
            break;
          case 'Gradué':
            status = 'graduate';
            break;
          case 'Sûppot':
            status = 'suppot';
            break;
          case 'Incertain':
            status = 'unconfirmed';
            break;
        }
        identity.status = {'value':status};
      }
      return identity;
    }else{
      return null;
    }
  }

}

module.exports = IndentityParser;
