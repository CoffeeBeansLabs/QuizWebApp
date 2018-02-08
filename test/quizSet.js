let chai = require('chai');
let assert = chai.assert;
let request = require('supertest');
const server = require('../server.js');

descibe('quizeSet', function () {
  describe('GET /bad',()=>{
   it('responds with 404',done=>{
     request(app)
       .get("/bad")
       .expect(404)
       .end(done)
   })
 })
})
