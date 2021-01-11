// @flow
import db from '../utils/db';

function findByNum(num: string): Promise<Prosopography> {
  return db
      .get()
      .collection('manus')
      .findOne({ Num: num });
}


async function create(manuscrit){
  const m = await findByNum(manuscrit.Num);
  if(m){
    //throw
    throw "Reference already exists";
  }else{
    return db
        .get()
        .collection('manus')
        .insert(manuscrit);
  }

}

async function importList(manuscritList){
    return db
        .get()
        .collection('manus')
        .drop()
        .then(() => {
          db.get()
          .collection('manus')
          .insertMany(manuscritList);
          });

}

/** *********************
 * Export               *
 ************************
 */
module.exports = {
  findByNum, create, importList
};
