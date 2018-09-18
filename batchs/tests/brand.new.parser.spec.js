// @flow

import { Readable } from 'stream';
import fs from 'fs';

import { computeOrSaveRecord, detectTypeOfLine, lineParser, processFile, addPropToRecord } from '../src/rawFilesParser/parser';

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
      let parsedLine = {
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
      };
      const expected = {
        "prop": "value",
      };
      const res = addPropToRecord(record, parsedLine);
      expect(res).toEqual(expected);
    });
    it('should return a record with tab value if multiple value', () => {
      let record = {
        "prop": "value",
      };
      let parsedLine = { "prop": "value2" };
      const expected = {
        "prop": ["value", "value2"],
      };
      const res = addPropToRecord(record, parsedLine);
      expect(res).toEqual(expected);
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
        reference: '1',
        name: 'Alex',
        nameVariant: 'Alessandro',
        job: 'Laboureur',
      };
      const saveRecordMock = jest.fn().mockReturnValue(Promise.resolve());

      // when
      const updatedRecord = computeOrSaveRecord(saveRecordMock)(record, parsedData);

      // then
      expect(updatedRecord).toEqual({});
      expect(saveRecordMock.mock.calls.length).toBe(1);
      // first call and first argument
      expect(saveRecordMock.mock.calls[0][0]).toEqual(record);
    });

    it('should not save the record when receiving an empty line and the record reference is missing', () => {
      // given
      const parsedData = {
        type: 'EMPTY',
      };
      const record = {
        name: 'Alex',
        nameVariant: 'Alessandro',
        job: 'Laboureur',
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

      // given
      const record = {
        reference: '1',
        name: 'Alban Richard',
        nameVariant: 'Alby Ricardo',
        job: 'Laboureur',
      };
      fs.writeFileSync('./test.tmp', `<1a>       ${record.reference}
<1b>    ${record.name}
<1c>    ${record.nameVariant}
<1d>    ${record.job}
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

      // given
      const records = [
        {
          reference: '1',
          name: 'Alban Richard',
          nameVariant: 'Alby Ricardo',
          job: 'Laboureur',
        },
        {
          reference: '10',
          name: 'ACCURSIUS',
          nameVariant: '$ACCURSIUS$',
          job: 'Servite',
        }
      ];
      fs.writeFileSync('./test.tmp', `<1a>       ${records[0].reference}
<1b>    ${records[0].name}
<1c>    ${records[0].nameVariant}
<1d>    ${records[0].job}

<1a>	${records[1].reference}
<1b>	${records[1].name}
<1c>	        ${records[1].nameVariant}
<1d>        ${records[1].job}
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
