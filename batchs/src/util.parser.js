class UtilParser {
  static findProperty(json, propertyName) {
    if (json && propertyName) {
      let props = propertyName.split('.');
      if (json[props[0]]) {
        if (props.length === 1) {
          return json[propertyName];
        } else {
          return UtilParser.findProperty(
            json[props[0]],
            props.slice(1).join('.')
          );
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  static parseName(json) {
    let res = null;
    if (json) {
      if (typeof json === 'string') {
        res = { value: json };
      } else {
        if (UtilParser.findProperty(json, 'pname.content')) {
          let val = json.pname.content;
          if (UtilParser.findProperty(json, 'pname.ptitle.content')) {
            val += ` ${json.pname.ptitle.content}`;
          }
          res = { value: val };
        } else if (json.pname && json.pname instanceof Array) {
          res = {
            value: json.pname
              .map(item => {
                return item.content;
              })
              .join(', '),
          };
        }
      }
    }
    return res;
  }
}

export default UtilParser;
