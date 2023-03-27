const app = require('../app');
const request = require('supertest');

describe('POST /mutation/', function () {
  it('deberia retornar un codigo de estado 200 si se detecta una mutacion', function (done) {
    request(app)
      .post('/mutation/')
      .send({
        dna: [
          'ATGCGA',
          'CAGTGC',
          'TTATGT',
          'AGAAGG',
          'CCCCTA',
          'TCACTG'
        ]
      })
      .expect(200, done);
  });

  it('deberia retornar un codigo de estado 403 si no se detecta una mutacion', function (done) {
    request(app)
      .post('/mutation/')
      .send({
        dna: [
          'ATGCGA',
          'CAGTGC',
          'TTATTT',
          'AGACGG',
          'GCGTCA',
          'TCACTG'
        ]
      })
      .expect(403, done);
  });
  
});
