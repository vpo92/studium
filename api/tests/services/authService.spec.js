
import mongoose from 'mongoose';
import auth from '../../src/services/authService';
import User from '../../src/models/userModel';
const mail = 'authService-'+(new Date().toUTCString().toLowerCase())+'@mail.com';

beforeAll( async () => {
  await mongoose.connect('mongodb://localhost/studium-test');
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


afterAll(() => {
  mongoose.disconnect();
});
