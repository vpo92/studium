// @flow

import React, { Component } from 'react';
import injectSheet from 'react-jss';

import styles from './DetailsPage.style';
import SimpleInformation from './SimpleInformation.component';
import SimpleListInformation from './SimpleListInformation.component';

import localeData from './../../locales/messages.json';

import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Typography from 'material-ui/Typography';

type Props = {
  classes: any,
  block: Object,
  blockLabel: String,
};

class GenericBlock extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }


  render() {
    const { block, blockLabel } = this.props;
    if(block){
      const keys = Object.keys(block);
      return (<ExpansionPanel>
         <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
           <Typography
             type="headline"
             className={this.props.classes.primaryColor}
           >
             {blockLabel}
           </Typography>
         </ExpansionPanelSummary>
         <ExpansionPanelDetails>
           <Typography component="div" style={{ padding: 8 * 3 }}>
        {keys.map(k => {
          const val = block[k];
          const label = localeData.fr[k];
          if(val instanceof Array){
            return <SimpleListInformation
              label={label}
              value={val}
            />
          }else{
            return <SimpleInformation
              label={label}
              value={val}
            />
          }
        })}
      </Typography>
    </ExpansionPanelDetails>
  </ExpansionPanel>

      );
    }else{
      return ("");
    }


  }
}


export default injectSheet(styles)(GenericBlock);
