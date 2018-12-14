// @flow

import { Readable } from 'stream';
import fs from 'fs';

import { computeOrSaveRecord, detectTypeOfLine, lineParser, processFile } from '../src/rawFilesParser/parser';
import { addPropToRecord } from '../src/rawFilesParser/prop.util';

describe('Brand new parser', () => {

  describe('detectTypeOfLine', () => {
    it('should detect bibliography among empty, bibliography or data lines', () => {
      // given
      const line = 'C	BIBLIOGRAPHIE';

      // when
      const type = detectTypeOfLine(line);

      // then
      expect(type).toEqual('BIBLIOGRAPHY_START');
    });

    it('should detect data lines among empty, bibliography or data lines', () => {
      // given
      const line = `<7c>	Notaire, souscripteur d'un acte de $JEAN XXIII$ émis à *Bologne en %1414%.C	BIBLIOGRAPHIE`;

      // when
      const type = detectTypeOfLine(line);

      // then
      expect(type).toEqual('DATA');
    });

    it('should detect empty lines among empty, bibliography or data lines', () => {
      // given
      const line = ``;

      // when
      const type = detectTypeOfLine(line);

      // then
      expect(type).toEqual('EMPTY');
    });

    it('should detect error if not empty, bibliography or data lines', () => {
      // given
      const line = `ERROR`;

      // when
      const type = detectTypeOfLine(line);

      // then
      expect(type).toEqual('ERROR');
    });
  });

  describe('lineParser', () => {
    it('should parse a line containing a reference', () => {
      // given
      const line = `<1a>     1`;

      // when
      const recordParsed = lineParser(line);

      // then
      expect(recordParsed).toEqual({
        value: {
          "reference": {
            "value": "1",
            "meta": {
              "dates": null,
              "institutions": null,
              "isComment": false,
              "isLink": false,
              "names": null,
              "places": null,
              "titles": null,
            },
          },
        },
        type: 'DATA',
      });
    });

    it(`should send an ERROR line if couldn't parse`, () => {
      // given
      const line = `<<b>>	Écrit en %1473%.`;

      // when
      const recordParsed = lineParser(line);

      // then
      expect(recordParsed).toEqual({
        type: 'ERROR',
      });
    });

    it(`should send an ERROR line if the data type is unknown`, () => {
      // given
      const line = `<ff>	Écrit en %1473%.`;

      // when
      const recordParsed = lineParser(line);

      // then
      expect(recordParsed).toEqual({
        type: 'ERROR',
      });
    });
  });

  describe('addPropToRecord', () => {
    it('should return a record with new value', () => {
      let record = {};
      const meta = {
        "dates": null,
        "institutions": null,
        "isComment": false,
        "isLink": false,
        "names": null,
        "places": null,
        "titles": null,
      };

      const parsedLine = {
        value: {
          "reference": {
            "value": "1",
            "meta": meta,
          },
        },
        type: 'DATA',
      };
      const expected = {
        "reference": {
        "meta": meta,
        "value": "1"
        }
      };
      let res = addPropToRecord(record, parsedLine);
      expect(res).toEqual(expected);
      const parsedLine2 = {
        value: {
          "name": {
            "value": "ROMANUS",
            "meta": meta,
          },
        },
        type: 'DATA',
      };
      const expected2 = {
        "reference": {
        "meta": meta,
          "value": "1"
        },
        "name": {
          "value": "ROMANUS",
          "meta": meta,
        }
      };
      res = addPropToRecord(res, parsedLine2);
      expect(res).toEqual(expected2);

    });
    it('should return a record with tab value if multiple value', () => {
      const meta = {
        "dates": null,
        "institutions": null,
        "isComment": false,
        "isLink": false,
        "names": null,
        "places": null,
        "titles": null,
      };

      let record = {
          nameVariant:{
            value:'ROMANUS',
            meta:meta,
            },
      };

      let parsedLine = {
        value: {
          nameVariant: {
            "value": "ROMANUS 2",
            "meta": meta,
          },
        },
        type: 'DATA',
      };

      const expected = {
        nameVariant: [
          {
            "value": "ROMANUS",
            "meta": meta,
          },
          {
            "value": "ROMANUS 2",
            "meta": meta,
          }
        ]
      };
      let res = addPropToRecord(record, parsedLine);
      expect(res).toEqual(expected);

      const expected2 = {
        nameVariant: [
          {
            "value": "ROMANUS",
            "meta": meta,
          },
          {
            "value": "ROMANUS 2",
            "meta": meta,
          },
          {
            "value": "ROMANUS 2",
            "meta": meta,
          }
        ]
      };

      res = addPropToRecord(res, parsedLine);
      expect(res).toEqual(expected2);

    });

  });


  describe('computeOrSaveRecord', () => {
    it('should return the updated record containing the line parsed value', () => {
      // given
      const parsedData = {
        type: 'DATA',
        value: {
          reference: '1',
        }
      };
      const record = {}
      const saveRecordMock = jest.fn();

      // when
      const updatedRecord = computeOrSaveRecord(saveRecordMock)(record, parsedData);

      // then
      expect(updatedRecord).toEqual({
        reference: '1',
      });
      expect(saveRecordMock.mock.calls.length).toBe(0);
    });

    it('should save the record and return an empty record when receiving an empty line', () => {
      // given
      const parsedData = {
        type: 'EMPTY',
      };
      const record = {
        reference: {value:"1"},
        name: {value:'Alex'},
        nameVariant: {value:'Alessandro'},
      };
      const expected = {
        reference: "1",
        identity:{
          name: {value:'Alex'},
          nameVariant: {value:'Alessandro'},
          gender: {value:'male'},
        }
      };
      const saveRecordMock = jest.fn().mockReturnValue(Promise.resolve());

      // when
      const updatedRecord = computeOrSaveRecord(saveRecordMock)(record, parsedData);

      // then
      expect(updatedRecord).toEqual({});
      expect(saveRecordMock.mock.calls.length).toBe(1);
      // first call and first argument
      expect(saveRecordMock.mock.calls[0][0]).toEqual(expected);
    });

    it('should not save the record when receiving an empty line and the record reference is missing', () => {
      // given
      const parsedData = {
        type: 'EMPTY',
      };
      const record = {
        name: 'Alex',
        nameVariant: 'Alessandro',
      };
      const saveRecordMock = jest.fn().mockReturnValue(Promise.resolve());

      // when
      const updatedRecord = computeOrSaveRecord(saveRecordMock)(record, parsedData);

      // then
      expect(updatedRecord).toEqual({});
      expect(saveRecordMock.mock.calls.length).toBe(0);
    });

  });

  describe('processFile', () => {
    it('should parse lines of a single record', async () => {
      const meta = {
        "dates": null,
        "institutions": null,
        "isComment": false,
        "isLink": false,
        "names": null,
        "places": null,
        "titles": null,
      };
      // given
      const record = {
        reference: '1',
        identity:{
          name: {
            value:'Alban Richard',
            meta: meta,
          },
          nameVariant: [{
            value:'$Adam WAQUET de VILLEMONTOIR$',
            meta: {
              "dates": null,
              "institutions": null,
              "isComment": false,
              "isLink": false,
              "names": ["Adam WAQUET de VILLEMONTOIR"],
              "places": null,
              "titles": null,
            },
          },
            {
              value:'$Adam WAQUET de VILLEMONTOIR 2$',
              meta: {
                "dates": null,
                "institutions": null,
                "isComment": false,
                "isLink": false,
                "names": ["Adam WAQUET de VILLEMONTOIR 2"],
                "places": null,
                "titles": null,
              },
          },
          {
              value:'$Adam WAQUET de VILLEMONTOIR 3$',
              meta: {
                "dates": null,
                "institutions": null,
                "isComment": false,
                "isLink": false,
                "names": ["Adam WAQUET de VILLEMONTOIR 3"],
                "places": null,
                "titles": null,
              },
            },
          ],
          "gender": {
            value:"male"
          },
        },
      };
      fs.writeFileSync('./test.tmp', `<1a>       ${record.reference}
<1b>   ${record.identity.name.value}
<1c>	${record.identity.nameVariant[0].value}
<r>	GOROCHOV: p. 712-713.
<1c>	${record.identity.nameVariant[1].value}
<r>	GOROCHOV: p. 712-713.
<1c>	${record.identity.nameVariant[2].value}
<r>	GOROCHOV: p. 712-713.
`);
      const saveRecordMock = jest.fn().mockReturnValue(Promise.resolve());

      // when
      await processFile('./test.tmp', saveRecordMock);

      // then
      expect(saveRecordMock.mock.calls.length).toBe(1);
      // first call and first argument
      expect(saveRecordMock.mock.calls[0][0]).toEqual(record);

      fs.unlinkSync('./test.tmp');
    });

    it('should parse lines of two records', async () => {
      const meta = {
        "dates": null,
        "institutions": null,
        "isComment": false,
        "isLink": false,
        "names": null,
        "places": null,
        "titles": null,
      };
      // given
      const records = [
        {
          reference: '1',
          identity:{
            name: {value:'Alby Ricardo',meta:meta},
            nameVariant: {value:'Alby Ricardo',meta:meta},
            gender: {value:'male'},
          },
        },
        {
          reference: '10',
          identity:{
            name: {value:'Alby Ricardo 2',meta:meta},
            nameVariant: {value:'Alby Ricardo 2',meta:meta},
            gender: {value:'male'},
          },
        }
      ];
      fs.writeFileSync('./test.tmp', `<1a>       ${records[0].reference}
<1b>    ${records[0].identity.name.value}
<1c>    ${records[0].identity.nameVariant.value}

<1a>	${records[1].reference}
<1b>	${records[1].identity.name.value}
<1c>	${records[1].identity.nameVariant.value}
`);
      const saveRecordMock = jest.fn().mockReturnValue(Promise.resolve());

      // when
      await processFile('./test.tmp', saveRecordMock);

      // then
      expect(saveRecordMock.mock.calls.length).toBe(2);
      // first call and first argument
      expect(saveRecordMock.mock.calls[0][0]).toEqual(records[0]);
      // second call and first argument
      expect(saveRecordMock.mock.calls[1][0]).toEqual(records[1]);

      fs.unlinkSync('./test.tmp');
    });
  });
});
