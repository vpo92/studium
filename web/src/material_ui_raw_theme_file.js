import * as Colors from '@material-ui/core/colors';
import { spacing, createMuiTheme } from '@material-ui/core/styles';

const rawBaseTheme = {
  ...spacing,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: Colors.indigo500,
    primary2Color: Colors.indigo700,
    primary3Color: Colors.lightBlack,
    accent1Color: Colors.pinkA200,
    accent2Color: Colors.grey100,
    accent3Color: Colors.grey500,
    textColor: Colors.darkBlack,
    alternateTextColor: Colors.white,
    canvasColor: Colors.white,
    borderColor: Colors.grey300,
  },
};

//Theme must be wrapped in funciton getMuiTheme
export default createMuiTheme(rawBaseTheme);
