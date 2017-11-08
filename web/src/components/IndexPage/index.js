import React, { PropTypes, Component } from 'react';
import {Tabs, Tab} from 'material-ui/Tabs';
import {List, ListItem} from 'material-ui/List';


const data =[
  {lastname:"MAGNUS",name:""},
  {lastname:"MAHENTA",name:" la Bernarde"},
  {lastname:"MAKOLINUS",name:" de Caryneors"},
  {lastname:"MALTILDIS",name:""},
  {lastname:"MAMMETUS",name:" Galie"},
  {lastname:"MANFREDUS",name:" Lumbardus"},
  {lastname:"MANG",name:" Steyner"},
  {lastname:"MANINNUS",name:" de Janua"},
  {lastname:"MARCELLUS",name:""},
  {lastname:"MARCIARDUS",name:""},
  {lastname:"MARCUS",name:" de Cernay"},
  {lastname:"MARCUS",name:" LEO de Mantoue"},
  {lastname:"MARCUS",name:" Leschere"},
  {lastname:"MARCUS",name:" de Mediolano"},
  {lastname:"MARCUS",name:" Travers"},
  {lastname:"MARCUS",name:" de Valle"},
  {lastname:"MARCVARDUS",name:" de Zayense"},
  {lastname:"MARGARETA ",name:"dou Celier"},
  {lastname:"MARGARETA",name:" la Choquette"},
  {lastname:"MARGARETA",name:" de Troancio"},
  {lastname:"MARGARETA",name:" de Ypra"},
  {lastname:"MARIA",name:" Alorie"},
  {lastname:"MARIA",name:" de Lingonis"},
];

const Row = (row) => {
  return (
    <ListItem key={row.lastname+row.name}
            primaryText={row.lastname+" "+row.name}
            secondaryText="Jan 10, 2014"
          />
  );
}

class IndexPage extends Component {

  render() {
    return (
    <div>
      <h1>Index</h1>
      <Tabs>
        <Tab label="A"></Tab>
        <Tab label="B"></Tab>
        <Tab label="C"></Tab>
        <Tab label="D"></Tab>
        <Tab label="E"></Tab>
        <Tab label="F"></Tab>
        <Tab label="G"></Tab>
        <Tab label="H"></Tab>
        <Tab label="I"></Tab>
        <Tab label="J"></Tab>
        <Tab label="K"></Tab>
        <Tab label="L"></Tab>
        <Tab label="M"></Tab>
        <Tab label="N"></Tab>
        <Tab label="O"></Tab>
        <Tab label="P"></Tab>
        <Tab label="Q"></Tab>
        <Tab label="R"></Tab>
        <Tab label="S"></Tab>
        <Tab label="T"></Tab>
        <Tab label="U"></Tab>
        <Tab label="V"></Tab>
        <Tab label="W"></Tab>
        <Tab label="X"></Tab>
        <Tab label="Y"></Tab>
        <Tab label="Z"></Tab>
      </Tabs>
      <List>
        {data.map(Row)}
      </List>
    </div>
    );
  }
}

export default IndexPage;
