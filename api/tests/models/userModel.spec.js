// @flow

import mongoose from 'mongoose';
import User from '../../src/models/userModel';

const tag = new Date().toUTCString().toLowerCase();

beforeAll( async () => {
  await mongoose.connect('mongodb://localhost/studium-test');
});

describe('userModel', () => {

  describe('validate', () => {
    it('should be invalid if is empty', async () =>  {
        let user = new User();
        try{
          await user.validate();
        }catch(err){
          expect(err).toBeDefined();
          expect(err.errors.email).toBeDefined();
          expect(err.errors.name).toBeDefined();
        }
    });




      it('should be ok with correct values', async () => {

          let user = new User({
            name : 'vincent',
            email : `me-${tag}@mail.com`,
            password : 'pass',
          });

          try{
            await user.validate();
          }catch(err){
            expect(err).toBeUndefined();
          }
        });

        it('should be ko with duplicated email or username', async () => {
            let user = new User({
              name : 'vincent',
              email : `me-${tag}@mail.com`,
              password : 'pass',
            });

            try{
              await user.save();
              await user.validate();
              expect(null).toBeDefined();
            }catch(err){
              expect(err).toBeDefined();
            }
          });

    });

  describe('create', () => {
    it('should work with good values', async () => {
      let user = new User({
        name : 'vincent',
        email : `me2-${tag}@mail.com`,
        password : 'pass',
      });
      try{
        let newUser = await user.save();
        expect(newUser._id).toBeDefined();
        expect(newUser.name).toEqual('vincent');
        expect(newUser.email).toEqual(`me2-${tag}@mail.com`);
        expect(newUser.password).toBeDefined();
        expect(newUser.role).toContain('user');
        expect(newUser.role.length).toEqual(1);
        expect(newUser.salt).toBeDefined();

      }catch(err){
        expect(err).toBeUndefined();
      }
    });
  });
});

afterAll(() => {
  mongoose.disconnect();
});
