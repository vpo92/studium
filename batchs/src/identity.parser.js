class IndentityParser{

  static findProperty(json, propertyName){
    if(json && propertyName){
      let props = propertyName.split('.');
      if(json[props[0]]){
        if(props.length === 1){
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
    let res = null;
    if(json){
      if(json.dates){
        if(json.dates.date){
          res = {
            'from': IndentityParser.findProperty(json,'dates.date.content')?(json.dates.date.content).toString():"%",
            'to': IndentityParser.findProperty(json,'dates.date.content')?(json.dates.date.content).toString():"%",
          }
        }else{
          res = {
            'from': IndentityParser.findProperty(json,'dates.fromDate.date.content')?(json.dates.fromDate.date.content).toString():"%",
            'to': IndentityParser.findProperty(json,'dates.toDate.date.content')?(json.dates.toDate.date.content).toString():"%",
          }
        }

      }else if(typeof json === "string"){
        if(json.indexOf("-") > 0){
          res = {
            'from': json.split('-')[0].trim(),
            'to': json.split('-')[1].trim(),
          };
        }
      }
    }
    return res;
  }

  static parseName(json){
    let res = null;
    if(json){
      if(typeof json === "string"){
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
    let res = null;
    if(json){
      if(json instanceof Array){
        res = json.map( item => {
          if(item.data){
            return IndentityParser.parseName(item.data); // {'value':item.data.pname.content});
          }
          return;
        });
      }else{
        if(json.data){
          res = [IndentityParser.parseName(json.data)];
        }
      }
    }
    return res;
  }

  static parseDescription(data){
    let res = null;
    if(data){
      if(typeof data === "string"){
        res = {'value':data};
      }else{
        if(data.content){
          let s = data.content[0];
          if(data.ptitle){
            s += " "+data.ptitle.content;
          }
          if(data.place){
            s+=" à "+data.place;
          }
          res = {'value':s};
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
      let identity = {};
      let name = IndentityParser.findProperty(json,"prosop.person.label.usage-name.data");
      if(name){
        identity.name = {'value':name};
      }

      let nameVariant = IndentityParser.findProperty(json,"prosop.person.label.variant-name");
      if(nameVariant){
        identity.nameVariant = IndentityParser.parseNameVariant(nameVariant);
      }

      let description =  IndentityParser.findProperty(json,"prosop.person.label.description.data");
      if(description){
        identity.description = IndentityParser.parseDescription(description);
      }

      let datesOfLife = IndentityParser.findProperty(json,"prosop.person.label.datesOfLife.data");
      if(datesOfLife){
        identity.datesOfLife = IndentityParser.parseDates(datesOfLife);
      }

      let datesOfActivity = IndentityParser.findProperty(json,"prosop.person.label.datesOfActivity.data");
      if(datesOfActivity){
        identity.datesOfActivity = IndentityParser.parseDates(datesOfActivity);
      }

      //FIXME data source for mapping of activityMediane: ???
      //donnee calcule : milieu des deux date d'activite et arrondi superieur

      //data source for mapping of gender ???
      //si rien, c'est un homme, sinon f c(est une femme. paragraphe 1h)
      //ada margarita ... fiche n°16
      console.log(IndentityParser.findProperty(json,"prosop.person.label"));
      let gender =  IndentityParser.findProperty(json,"prosop.person.label.sex.data")?"female":"male";
      identity.gender = {'value':gender};


      //FIXME : 15347 tab ?? 9885 10424
      let status =  IndentityParser.findProperty(json,"prosop.person.label.statut.data");
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
          default:
            status = 'other';
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
