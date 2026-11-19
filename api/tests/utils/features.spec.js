// @flow
const {
  parseBoolean,
  isFeatureEnabled,
} = require('../../src/utils/features');

describe('feature flags', () => {
  it('interprète les valeurs booléennes usuelles', () => {
    expect(parseBoolean('true')).toBe(true);
    expect(parseBoolean('TRUE')).toBe(true);
    expect(parseBoolean('1')).toBe(true);
    expect(parseBoolean('yes')).toBe(true);
    expect(parseBoolean('on')).toBe(true);
    expect(parseBoolean('false')).toBe(false);
    expect(parseBoolean('0')).toBe(false);
    expect(parseBoolean('no')).toBe(false);
    expect(parseBoolean('off')).toBe(false);
    expect(parseBoolean(undefined)).toBe(false);
    expect(parseBoolean('inconnu')).toBe(false);
    expect(parseBoolean('inconnu', true)).toBe(true);
  });

  it('lit une variable FEAT_<NOM> et la désactive par défaut', () => {
    delete process.env.FEAT_UNIT_TEST;
    expect(isFeatureEnabled('UNIT_TEST')).toBe(false);

    process.env.FEAT_UNIT_TEST = 'true';
    expect(isFeatureEnabled('UNIT_TEST')).toBe(true);

    process.env.FEAT_UNIT_TEST = 'false';
    expect(isFeatureEnabled('UNIT_TEST')).toBe(false);

    delete process.env.FEAT_UNIT_TEST;
  });
});
