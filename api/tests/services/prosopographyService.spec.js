
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

  describe('search', () => {
    it('should return result with correct values', async () =>  {
      try{
        let searchRequest = {
            name:"ADAM",
        };
        let prosopographies = await service.search(searchRequest);
        expect(prosopographies).toBeDefined();
      }catch(err){
        expect(err).toBeUndefined();
      }
    });
  });

  describe('convertSearchRequestToMongoRequest', () => {
    it('search by name should be ok', async () => {
      let searchRequest = {
          name:"roma",
      };
      let expected = {
        'identity.name.value': /^roma/,
      };
      let res = service.convertSearchRequestToMongoRequest(searchRequest);
      expect(res).toEqual(expected);
    });

    it('search by name and grades should be ok', async () => {
      let searchRequest = {
          name:"roma",
          grades:"ETU",
      };
      let expected = {"$and":[{'identity.name.value': /^roma/},{'curriculum.grades.value': /ETU/}]};
      let res = service.convertSearchRequestToMongoRequest(searchRequest);
      expect(res).toEqual(expected);
    });
    /** FIXME : RG for STATUS, GRADES, DISCIPLINE
    it('search by discipline and status should be ok', async () => {
      let searchRequest = {
          discipline:"roma",
          status:"",
      };
      let expected = {"$and":[{'identity.name.value': /^roma/},{'curriculum.grades.value': /^Étudiant/}]};
      let res = service.convertSearchRequestToMongoRequest(searchRequest);
      expect(res).toEqual(expected);
    });
    */

    it('search with one prosopography criterion should be ok', async () => {
      let searchRequest = {
          prosopography:[
            {
              section:"identity",
              subSection:"gender",
              operator:"AND",
              matchType:"EXACT",
              value:"male",
            },
          ],
      };
      let expected = {'identity.gender.value': 'male'};
      let res = service.convertSearchRequestToMongoRequest(searchRequest);
      expect(res).toEqual(expected);
    });

    it('search with multiple prosopography criterions should be ok', async () => {
      let searchRequest = {
          prosopography:[
            {
              section:"identity",
              subSection:"gender",
              operator:"AND",
              matchType:"EXACT",
              value:"male",
            },
            {
              section:"curriculum",
              subSection:"university",
              operator:"AND",
              matchType:"CONTAINS",
              value:"Paris",
            },
          ],
      };
      let expected =
        {"$and":[
          {'identity.gender.value': 'male'},
          {'curriculum.university.value': /Paris/},
        ]};

      let res = service.convertSearchRequestToMongoRequest(searchRequest);
      expect(res).toEqual(expected);
    });


  })

});


 afterAll( async() => {
  await db.get().close();
});
