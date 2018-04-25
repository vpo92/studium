import { Readable } from 'stream';

import { detectTypeOfLIne, parser, processStream } from '../src/parser';

describe('Brand new parser', () => {
  it('should detect bibliography among empty, bibliography or data lines', () => {
    // given
    const line = 'C	BIBLIOGRAPHIE';

    // when
    const type = detectTypeOfLIne(line);

    // then
    expect(type).toEqual('BIBLIOGRAPHY');
  });

  it('should detect data lines among empty, bibliography or data lines', () => {
    // given
    const line = `<7c>	Notaire, souscripteur d'un acte de $JEAN XXIII$ émis à *Bologne en %1414%.C	BIBLIOGRAPHIE`;

    // when
    const type = detectTypeOfLIne(line);

    // then
    expect(type).toEqual('DATA_LINE');
  });

  it('should detect empty lines among empty, bibliography or data lines', () => {
    // given
    const line = ``;

    // when
    const type = detectTypeOfLIne(line);

    // then
    expect(type).toEqual('EMPTY_LINE');
  });

  it('should detect error if not empty, bibliography or data lines', () => {
    // given
    const line = `ERROR`;

    // when
    const type = detectTypeOfLIne(line);

    // then
    expect(type).toEqual('ERROR_LINE');
  });

  it('should parse a line of a single record', () => {
    // given
    const line = `<1a>     1`;
    const record = {};

    // when
    const recordParsed = parser(record, line);

    // then
    expect(recordParsed).toEqual({
      reference: '1',
    });
  });

  it.skip('should parse lines of a single record', () => {
    const s = new Readable();
    s._read = function noop() {};

    // given
    const name = 'Alban Richard';
    const nameVariant = 'Alby Ricardo';
    const job = 'Laboureur';
    s.push(`<1a>     1
<1b>    ${name}
<1c>    ${nameVariant}
<1d>    ${job}

`);

    const record = {};

    // when
    const recordParsed = processStream(s);

    // then
    expect(recordParsed).toEqual({
      reference: '1',
      name,
      nameVariant,
      job,
    });
  });
});
