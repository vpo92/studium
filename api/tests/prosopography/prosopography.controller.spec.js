import service from '../../src/services/prosopographyService';

describe('prosopography.service', () => {
  describe('prosopography.service.findAll', () => {
    it('should raise error if wrong db', done => {
      const res = {
        json: data => {
          expect(data.error).toEqual('error retriving connexion to database');
        },
      };
      expect(() => service.findAll(null, res)).toThrowError();
      done();
    });
  });
});
