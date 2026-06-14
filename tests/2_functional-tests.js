const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  let idTestBook; 

  // Este bloque corre ANTES de todos los tests para asegurar que tengamos un ID válido en la DB
  before(function(done) {
    chai.request(server)
      .post('/api/books')
      .send({ title: 'Libro Inicial de Carga' })
      .end(function(err, res) {
        idTestBook = res.body._id;
        done();
      });
  });

  suite('Routing tests', function() {

    suite('POST /api/books with title => create book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Libro de Prueba' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            assert.equal(res.body.title, 'Libro de Prueba');
            done();
          });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field title');
            done();
          });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books', function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'La respuesta debe ser un array');
            assert.property(res.body[0], 'commentcount');
            assert.property(res.body[0], 'title');
            assert.property(res.body[0], '_id');
            done();
          });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with valid id', function(done){
        chai.request(server)
          .get('/api/books/' + idTestBook)
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body._id, idTestBook);
            assert.isArray(res.body.comments);
            done();
          });
      });
      
      test('Test GET /api/books/[id] with id not in database', function(done){
        chai.request(server)
          .get('/api/books/60c72b2f9b1d8b2badfa1111') 
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
          .post('/api/books/' + idTestBook)
          .send({ comment: 'Excelente lectura' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body._id, idTestBook);
            assert.include(res.body.comments, 'Excelente lectura');
            done();
          });
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        chai.request(server)
          .post('/api/books/' + idTestBook)
          .send({})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field comment');
            done();
          });
      });

      test('Test POST /api/books/[id] with id not in database', function(done){
        chai.request(server)
          .post('/api/books/60c72b2f9b1d8b2badfa1111')
          .send({ comment: 'Un comentario fantasma' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function(){

      test('Test DELETE /api/books/[id] with valid id', function(done){
        chai.request(server)
          .delete('/api/books/' + idTestBook)
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'delete successful');
            done();
          });
      });

      test('Test DELETE /api/books/[id] with id not in database', function(done){
        chai.request(server)
          .delete('/api/books/60c72b2f9b1d8b2badfa1111')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });

    });

  });

});