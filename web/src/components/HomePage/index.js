import React, { PropTypes, Component } from 'react';
import Divider from 'material-ui/Divider';
import header from './img/header.png';
import univ_paris1 from './img/univ_paris1.jpg';
import lamop from './img/lamop.jpg';
import cnrs from './img/cnrs.jpg';
import erc_logo from './img/erc_logo.png';
import Logo_Hastec from './img/Logo_Hastec.jpg';

class HomePage extends Component {

  render() {
    return (
    <div>
      <h1>Projet Studium Parisiense</h1>
      <div className="app-text-center"><img src={header} /></div>
      <div className="app-text-big">
        <p>
        Développée dans le cadre du projet Studium Parisiense , l’un des axes de recherche du programme européen «Signs and States» dirigé par Jean-Philippe Genet et financé par l’European Research Council, la base de données prosopographique Studium Parisiense est consacrée aux membres des écoles et de l’université de Paris entre le XIIe et le XVIe siècle. Les quelque 15 000 fiches qui la composent contiennent des informations biographiques et bibliographiques relatives, entre autres, aux professeurs, aux étudiants et aux suppôts de l’Université.
        </p>
        <p>
        Ce projet, commencé par Jean-Philippe Genet, dans un but pédagogique, pour former les étudiants d’histoire au travail collectif de construction des bases de données historiques, a permis de réunir une somme considérable de données, grâce au dépouillement de nombreux répertoires biographiques et travaux de recherche.
        </p>
        <p>
        Afin de rendre consultables et utilisables ces données, un travail d’harmonisation et de restructuration est actuellement mené, sous la direction de Jean-Philippe Genet et de Thierry Kouamé, dans le cadre du projet. Parallèlement, le dépouillement de nouveaux répertoires biographiques et de travaux prosopographiques récents contribue à enrichir la base.
        </p>
      </div>
      <Divider />
      <img src={univ_paris1} className="app-home-sponsor-img"/>
      <img src={lamop} className="app-home-sponsor-img"/>
      <img src={cnrs} className="app-home-sponsor-img"/>
      <img src={erc_logo} className="app-home-sponsor-img"/>
      <img src={Logo_Hastec} className="app-home-sponsor-img"/>
    </div>
    );
  }
}

export default HomePage;