import util from '../../src/common/controller.util';

describe('controller.util', function() {
  describe('controller.util.handleError', function() {
    it('should work if no error provided', function(done) {
      let res = {
        json: () => {
          expect(res.statusCode).toEqual(500);
        },
      };
      util.handleError(res)(null);
      done();
    });

    it('should work if error provided', function(done) {
      let res = {
        json: data => {
          expect(res.statusCode).toEqual(500);
          expect(data).toEqual({ error: 'coucou' });
        },
      };
      util.handleError(res)('coucou');
      done();
    });
  });

  describe('controller.util.handleData', function() {
    it('should work if no data provided', function(done) {
      let res = {
        json: data => {
          expect(res.statusCode).toEqual(200);
          expect(data).toEqual(null);
        },
      };
      util.handleData(res)(null);
      done();
    });

    it('should work if data provided', function(done) {
      let res = {
        json: data => {
          expect(res.statusCode).toEqual(200);
          expect(data).toEqual('coucou');
        },
      };
      util.handleData(res)('coucou');
      done();
    });
  });
});
