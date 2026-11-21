
import mongoose from 'mongoose';
import auth from '../../src/services/authService';
import User from '../../src/models/userModel';
import mongoUri from '../mongoUri';
const mail = 'authService-'+(new Date().toUTCString().toLowerCase())+'@mail.com';

beforeAll( async () => {
  await mongoose.connect(mongoUri);
  //JDD

  let user = new User({
    name : 'vincent',
    email : mail,
    password : 'pass',
  });
  await user.save();
});

describe('authService', () => {

  describe('authenticate', () => {
    it('should be valid with correct values', async () =>  {
      try{
        let user = await auth.authenticate(mail,'pass');
        expect(user).toBeDefined();
        expect(user.name).toEqual('vincent');
      }catch(err){
        expect(err).toBeUndefined();
      }
    });

    it('should fail with wrong password', async () =>  {
      try{
        let user = await auth.authenticate(mail,'passo');
        expect(user).toBeUndefined();
      }catch(err){
        expect(err).toBeDefined();
      }
    });

    it('should fail with wrong user', async () =>  {
      try{
        let user = await auth.authenticate('toto','pass');
        expect(user).toBeUndefined();
      }catch(err){
        expect(err).toBeDefined();
      }
    });

  });
});

// Ticket #10 : après une restauration « full » qui remplace la table users,
// le compte de l'administrateur connecté peut disparaître. getUser lisait
// user.name avant le test de nullité : le suivi des jobs partait en erreur
// 500 muette. C'est désormais un 401 explicite.
describe('getUser — compte du jeton introuvable (régression #10)', () => {
  function mockRes() {
    const res = {
      statusCode: 0, payload: null, ended: false,
      status(code) { res.statusCode = code; return res; },
      json(body) { res.payload = body; return res; },
      end() { res.ended = true; return res; },
    };
    return res;
  }

  it('répond 401 avec un message explicite au lieu d\'un 500', async () => {
    const req = { user: { email: 'ghost-t10@nowhere.invalid' } };
    const res = mockRes();
    let nextError = null;
    let nextCalled = false;
    await auth.getUser(req, res, (error) => {
      if (error) { nextError = error; }
      nextCalled = true;
    });

    expect(nextError).toBeNull();
    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(401);
    expect(res.payload).toBeTruthy();
    expect(res.payload.message).toMatch(/[Cc]ompte introuvable/);
  });
});


afterAll(() => {
  mongoose.disconnect();
});
