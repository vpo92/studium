// URL MongoDB utilisée par les tests. Elle se configure via la variable
// d'environnement MONGODB_TEST_CONNECTION_STRING ; le défaut localhost
// correspond à une base de test locale (jamais la base de production).
// Exemple : MONGODB_TEST_CONNECTION_STRING=mongodb://localhost:27017/studium-test npm test
module.exports =
  process.env.MONGODB_TEST_CONNECTION_STRING || 'mongodb://localhost/studium-test';
