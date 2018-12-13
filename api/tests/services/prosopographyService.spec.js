
import db from '../../src/utils/db';
import service from '../../src/services/prosopographyService';
const tag = 'ref-'+(new Date().toUTCString().toLowerCase());

beforeAll( async () => {
  try{
     await db.connectAsync("mongodb://localhost/studium-test");
  }catch(err){
    expect(err).toBeUndefined();
  }
});

describe('prosopographyService', () => {

  describe('create', () => {
    it('should be valid with correct values', async () =>  {
      const p = {
        reference : tag,
        identity : {
          name : {
            value:"VINCENTUS",
          },
        },
      };
      try{
        await service.create(p);
        let prosopography = await service.findByReference(tag);
        expect(prosopography).toBeDefined();
        expect(prosopography.reference).toEqual(tag);
        expect(prosopography.identity.name.value).toEqual("VINCENTUS");
      }catch(err){
        expect(err).toBeUndefined();
      }
    });
  });

  describe('convertFromText', () => {
    it('should be valid with correct values', async () =>  {
      const txt = `<1a>${tag}
<1b>   VINCENTUS
<1c> VINCENT TUS`;
      const expected = {
        reference : 30,
        identity : {
          name : {
            value:"VINCENTUS",
          },
        },
      };
      try{
        let prosopography = await service.convertFromText(txt);
        console.log(prosopography);
        expect(prosopography).toBeDefined();
        expect(prosopography.reference).toEqual(tag);
        expect(prosopography.identity.name.value).toEqual("VINCENTUS");
        //expect(prosopography).toEqual(expected);
      }catch(err){
        expect(err).toBeUndefined();
      }
    });
  });


});


 afterAll( async() => {
  await db.get().close();
});
