// @flow

import { Readable } from 'stream';

import { processStream } from '../src/rawFilesParser/simpleParser';

function parse(text) {
  const records = [];
  const stream = new Readable();
  stream.push(text);
  stream.push(null);
  return processStream(stream, (record) => {
    records.push(record);
    return Promise.resolve();
  }).then(() => records[0]);
}

describe('simpleParser', () => {
  describe('references in written works', () => {
    // Reproduit la structure de la fiche 60565 (Jean Gerson) :
    // une version française dont la ligne de date est fermée par <<<b>>
    // au lieu de <<<b>>>, suivie de références puis d'un nouvel opus.
    const text = [
      '<1a> 60565',
      '<1b> JOHANNES de Gersonno',
      '<1e> %1363-1429%',
      '<1f> %1393-1429%',
      '<22> Auteur actif dans le champ pédagogique et philologique ;',
      '<22a9> &Donatus spiritualis&',
      '<<v>> &Donatus moralis&',
      '<<b>> ?',
      '<<b>> Authenticité incertaine ?',
      '<r> GLORIEUX, La vie et les œuvres …, 479 ;',
      '<r> JGDB.',
      '<<l>> Latin.',
      '<<k4a1>> &Le Donat espirituel&',
      '<<<b>> Avant %1480% ?',
      '<r> Base Jonas-IRHT/CNRS : http://jonas.irht.cnrs.fr/oeuvre/4071 (Marie-Laure SAVOYE) .',
      '<23> Auteur actif dans le champ scientifique :',
      '<23a1> &Trigilogium astrologiae theologizatae&',
      '<<b>> %1419% (novembre) à *Lyon ;',
      '<<b>> /Riposte à la diffusion de l’&Apologia Astronomiae judicialis& ;',
      '<r> GLORIEUX, La vie et les œuvres …, 185 ;',
      '<r> GLORIEUX (P.), &Jean Gerson. Oeuvres complètes, X. L’oeuvre polémique&, n° 501 ;',
      '<r> JGDB.',
      '<<l>> Latin.',
    ].join('\n');

    it('should keep version data and attach its reference to the right field', () => {
      return parse(text).then((record) => {
        const donat = record.textualProduction.philosophyExtended.opus[0];
        const version = donat.versions[0];

        // La ligne <<<b>> doit être une donnée de version, pas une donnée de prose.
        expect(version.dateAndPlace).toHaveLength(1);
        expect(version.dateAndPlace[0].value).toEqual('Avant %1480% ?');
        expect(version.dateAndPlace[0].reference).toHaveLength(1);
        expect(version.dateAndPlace[0].reference[0].trim()).toEqual(
          'Base Jonas-IRHT/CNRS : http://jonas.irht.cnrs.fr/oeuvre/4071 (Marie-Laure SAVOYE) .'
        );

        // Le titre de la version ne doit pas récupérer les références.
        const titleKey = Object.keys(version).find((key) => key !== 'dateAndPlace');
        const title = version[titleKey][0];
        expect(title.value).toEqual('&Le Donat espirituel&');
        expect(title.reference).toBeUndefined();
      });
    });

    it('should not attach references of the next opus to the previous version', () => {
      return parse(text).then((record) => {
        const trigilogium = record.textualProduction.science.opus[0];
        const lastDateAndPlace = trigilogium.dateAndPlace[1];

        expect(lastDateAndPlace.reference).toHaveLength(3);
        expect(lastDateAndPlace.reference.map((ref) => ref.trim())).toEqual([
          'GLORIEUX, La vie et les œuvres …, 185 ;',
          'GLORIEUX (P.), &Jean Gerson. Oeuvres complètes, X. L’oeuvre polémique&, n° 501 ;',
          'JGDB.',
        ]);
      });
    });
  });

  describe('repeated fields in an opus', () => {
    const text = [
      '<1a> 60565',
      '<1b> JOHANNES de Gersonno',
      '<1e> %1363-1429%',
      '<1f> %1393-1429%',
      '<22> Auteur actif dans le champ philosophique ;',
      '<22a4> &Hic depingatur actor iacens in lecto&',
      '<<b>> Avant %1416% ;',
      '<<c>>\t/Ce manuscrit de la bibliothèque de Saint-Victor ;',
      '<r>\tCALVOT (D.) et OUY (G.), 45-46 ;',
      '<r>\tOUY (G.), Une maquette de manuscrit à peinture ;',
      '<r>\tJGDB, n° 576.',
      '<<l>>\tLatin.',
      '<<c>>\tMS. Paris, BnF latin 14643, f. 269r-283v.',
      '<<cc>>\tInc. : ‘Hic depingatur actor iacens in lecto …’.',
    ].join('\n');

    it('should keep the first group and its references when the same field appears again', () => {
      return parse(text).then((record) => {
        const opus = record.textualProduction.philosophyExtended.opus[0];

        expect(opus.manuscrits).toHaveLength(2);
        expect(opus.manuscrits[0].value).toContain('Ce manuscrit');
        expect(opus.manuscrits[0].reference.map((ref) => ref.trim())).toEqual([
          'CALVOT (D.) et OUY (G.), 45-46 ;',
          'OUY (G.), Une maquette de manuscrit à peinture ;',
          'JGDB, n° 576.',
        ]);
        expect(opus.manuscrits[1].value).toContain('MS. Paris');
        expect(opus.manuscrits[1].reference).toBeUndefined();
      });
    });
  });

  describe('comments in bibliography', () => {
    const text = [
      '<1a> 60565',
      '<1b> JOHANNES de Gersonno',
      '<1e> %1363-1429%',
      '<1f> %1393-1429%',
      '<99c>\tARLIMA (Laurent BRUN) :',
      '<99c>\t//https://arlima.net/no/299 ;',
      '<99c>\tI.R.H.T. Base JONAS ;',
    ].join('\n');

    it('should attach URLs and comments to the previous bibliography entry', () => {
      return parse(text).then((record) => {
        const otherBases = record.bibliography.otherBases;

        expect(otherBases).toHaveLength(2);
        expect(otherBases[0].value).toEqual('ARLIMA (Laurent BRUN) :');
        expect(otherBases[0].comment[0].trim()).toEqual('//https://arlima.net/no/299 ;');
        expect(otherBases[1].value).toEqual('I.R.H.T. Base JONAS ;');
        expect(otherBases[1].comment).toBeUndefined();
      });
    });
  });
});
