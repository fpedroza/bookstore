//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Book = require('../app/models/book');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let util = require('util');

let should = chai.should();


chai.use(chaiHttp);

function logResponse(res) {
    console.log("response: status=" + res.status + "\nbody=" + util.inspect(res.body, {depth: null}));
}

//Our parent block
describe('Books', () => {
    beforeEach((done) => { //Before each test we empty the database
        Book.deleteMany({}, (err) => {
           done();
        });
    });
    
 /*
  * Test the /GET route
  */
  describe('/GET book', () => {
      it('GET all the books; currently none', (done) => {
        chai.request(server)
            .get('/book')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.length.should.be.eql(0);
              done();
            });
      });
  });

  /*
  * Test the /GET route
  */
  describe('/GET book', () => {
      it('GET all the books; there are some', (done) => {
        new Book({ 
            title: "The Lord of the Rings", 
            author: "J.R.R. Tolkien", 
            year: 1954, 
            pages: 1170 
        }).save((err, book) => {
            if(err) assert.fail("save book failed");
        });
        new Book({ 
            title: "The Bible", 
            author: "God", 
            year: 300, 
            pages: 2000 
        }).save((err, book) => {
            if(err) assert.fail("save book failed");
        });

        chai.request(server)
            .get('/book')
            .end((err, res) => {
                // logResponse(res);
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.length.should.be.eql(2);
              done();
            });
      });
  });

 /*
  * Test the /POST route
  */
  describe('/POST book', () => {
      // missing pages
      let book = {
        title: "The Lord of the Rings",
        author: "J.R.R. Tolkien",
        year: 1954
      };

      it('POST a book without pages field', (done) => {        
        chai.request(server)
            .post('/book')
            .send(book)
            .end((err, res) => {
                // logResponse(res);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('errors');
                res.body.errors.should.have.property('pages');
                res.body.errors.pages.should.have.property('kind').eql('required');
                done();
            });
      });

      it('POST a book with pages', (done) => {
        book.pages = 1170;
        
        chai.request(server)
            .post('/book')
            .send(book)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('object');
                res.body.should.have.property('message').eql('Book successfully added!');
                res.body.book.should.have.property('title');
                res.body.book.should.have.property('author');
                res.body.book.should.have.property('pages');
                res.body.book.should.have.property('year');
                done();
            });
      });
  });

 /*
  * Test the /GET/:id route
  */
  describe('/GET/:id book', () => {
      it('GET a book by the given id', (done) => {
        let book = new Book({ 
            title: "The Lord of the Rings", 
            author: "J.R.R. Tolkien", 
            year: 1954, 
            pages: 1170 
        });
        // console.log("book.id", book.id);
        book.save((err, book) => {
            // console.log("book", book);

            chai.request(server)
                .get('/book/' + book.id)
                .send(book)
                .end((err, res) => {
                    // logResponse(res);
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.should.have.property('title');
                    res.body.should.have.property('author');
                    res.body.should.have.property('pages');
                    res.body.should.have.property('year');
                    res.body.should.have.property('_id').eql(book.id);
                    done();
                });
        });
            
      });
  });

 /*
  * Test the /PUT/:id route
  */
  describe('/PUT/:id book', () => {
      it('UPDATE a book given the id', (done) => {
        let book = new Book({
            title: "The Chronicles of Narnia", 
            author: "C.S. Lewis", 
            year: 1948, 
            pages: 778
        });
        book.save((err, book) => {
            book.year = 1950;
            chai.request(server)
                .put('/book/' + book.id)
                .send(book)
                .end((err, res) => {
                    // logResponse(res);
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Book updated!');
                    res.body.book.should.have.property('year').eql(book.year);
                    done();
                });
          });
      });
  });

 /*
  * Test the /DELETE/:id route
  */
  describe('/DELETE/:id book', () => {
      it('DELETE a book given the id', (done) => {
        let book = new Book({
            title: "The Chronicles of Narnia", 
            author: "C.S. Lewis", 
            year: 1948, 
            pages: 
            778
        });
        book.save((err, book) => {
            chai.request(server)
                .delete('/book/' + book.id)
                .end((err, res) => {
                    // logResponse(res);
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Book successfully deleted!');
                    res.body.result.should.have.property('ok').eql(1);
                    res.body.result.should.have.property('n').eql(1);
                    done();
                });
          });
      });
  });

});
  