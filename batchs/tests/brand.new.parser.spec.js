import { Readable } from 'stream';
import fs from 'fs';

import { detectTypeOfLIne, parser, processFile } from '../src/rawFilesParser/parser';

describe('Brand new parser', () => {
  it('should detect bibliography among empty, bibliography or data lines', () => {
    // given
    const line = 'C	BIBLIOGRAPHIE';

    // when
    const type = detectTypeOfLIne(line);

    // then
    expect(type).toEqual('BIBLIOGRAPHY_START');
  });

  it('should detect data lines among empty, bibliography or data lines', () => {
    // given
    const line = `<7c>	Notaire, souscripteur d'un acte de $JEAN XXIII$ émis à *Bologne en %1414%.C	BIBLIOGRAPHIE`;

    // when
    const type = detectTypeOfLIne(line);

    // then
    expect(type).toEqual('DATA');
  });

  it('should detect empty lines among empty, bibliography or data lines', () => {
    // given
    const line = ``;

    // when
    const type = detectTypeOfLIne(line);

    // then
    expect(type).toEqual('EMPTY');
  });

  it('should detect error if not empty, bibliography or data lines', () => {
    // given
    const line = `ERROR`;

    // when
    const type = detectTypeOfLIne(line);

    // then
    expect(type).toEqual('ERROR');
  });

  it('should parse a line of a single record', () => {
    // given
    const line = `<1a>     1`;
    const record = {};

    // when
    const recordParsed = parser(record, line);

    // then
    expect(recordParsed).toEqual({
      value: {
        reference: '1',
      },
      type: 'DATA',
    });
  });

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
