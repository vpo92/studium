// @flow

import { Readable } from 'stream';
import fs from 'fs';

import { computeOrSaveRecord, detectTypeOfLine, lineParser, processFile } from '../src/rawFilesParser/parser';

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
          reference: '1',
        },
        type: 'DATA',
      });
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
      expect(saveRecordMock.mock.calls[0][0]).toBe(record);
    });
  });

  describe('processFile', () => {
    it('should parse lines of a single record', async () => {
      
      // given
      const reference = 1;
      const name = 'Alban Richard';
      const nameVariant = 'Alby Ricardo';
      const job = 'Laboureur';
      fs.writeFileSync('./test.tmp', `<1a>     ${reference}
<1b>    ${name}
<1c>    ${nameVariant}
<1d>    ${job}
`);

      // when
      const recordParsed = await processFile('./test.tmp');

      // then
      expect(recordParsed).toEqual({
        reference: '1',
        name,
        nameVariant,
        job,
      });

      fs.unlinkSync('./test.tmp');
    });
  });
});
