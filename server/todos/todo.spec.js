/* eslint-disable no-unused-expressions */
const chai = require('chai');
const chaiHTTP = require('chai-http');
const pool = require('../db/index');
const app = require('../app');

const { expect } = chai;

chai.use(chaiHTTP);

describe('Todo Actions', () => {
  before((done) => {
    pool.query('DELETE FROM todos;')
      .catch((error) => {
        throw error.stack;
      });

    chai.request(app)
      .post('/signup')
      .send({
        username: 'Human', email: 'human@being.com', password: 'humanbeing', password2: 'humanbeing'
      })
      .end(() => done());
  });

  describe('Create Todo', () => {
    let todo;

    beforeEach(() => {
      todo = {
        todoName: 'Write unit tests'
      };
    });

    it('should fail to create the todo if "authorization" is not set in the request header', (done) => {
      chai.request(app)
        .post('/todo')
        .send(todo)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirect;
          expect(res.req.path).to.be.eq('/login');
          done();
        });
    });

    it('should fail to create the todo if "authorization" in the req header is invalid', (done) => {
      chai.request(app)
        .post('/todo')
        .set('authorization', 'Bearer')
        .send(todo)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirect;
          expect(res.req.path).to.be.eq('/login');
          done();
        });
    });

    it('should fail to create the todo if the authorization token is invalid', (done) => {
      chai.request(app)
        .post('/todo')
        .set('authorization', 'Bearer invalidToken')
        .send(todo)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirect;
          expect(res.req.path).to.be.eq('/login');
          done();
        });
    });

    it('should fail to create the todo if the user id generated from the authorization token does not exist', (done) => {
      chai.request(app)
        .post('/todo')
        .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjZmJjYjIwLTA4ZTEtMTFlOS05MWZlLTlmMzg0M2Q5NDdmZCIsInVzZXJuYW1lIjoiY2xpbnRvbmFtZSIsImVtYWlsIjoibmt3b2NoYWNsaW50b25AZ21haWwuY29tYW1lIiwiaWF0IjoxNTQ1ODA5OTYzfQ.PhMNI57KYploKDfLqdx0Coije0mNaNq_5eBb7AVQkyI')
        .send(todo)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirect;
          expect(res.req.path).to.be.eq('/login');
          done();
        });
    });

    it('should fail to create the todo if "todoName" was not sent', (done) => {
      todo.todoName = undefined;
      chai.request(app)
        .post('/login')
        .send({ email: 'human@being.com', password: 'humanbeing' })
        .end((err, res) => {
          chai.request(app)
            .post('/todo')
            .set('authorization', `Bearer ${res.body.token}`) // get valid token
            .send(todo)
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(400);
              expect(res.body.message).to.be.eq('Your request was incomplete.');
              done();
            });
        });
    });

    it('should fail to create the todo if "todoName" was not not a string', (done) => {
      todo.todoName = 1;
      chai.request(app)
        .post('/login')
        .send({ email: 'human@being.com', password: 'humanbeing' })
        .end((err, res) => {
          chai.request(app)
            .post('/todo')
            .set('authorization', `Bearer ${res.body.token}`) // get valid token
            .send(todo)
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(400);
              expect(res.body.message).to.be.eq('Your todo was invalid.');
              done();
            });
        });
    });

    it('should fail to create the todo if the length of the sanitized todoname is less than one', (done) => {
      todo.todoName = '      ';
      chai.request(app)
        .post('/login')
        .send({ email: 'human@being.com', password: 'humanbeing' })
        .end((err, res) => {
          chai.request(app)
            .post('/todo')
            .set('authorization', `Bearer ${res.body.token}`) // get valid token
            .send(todo)
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(400);
              expect(res.body.message).to.be.eq('Your todo was invalid.');
              done();
            });
        });
    });

    it('should create the todo', (done) => {
      chai.request(app)
        .post('/login')
        .send({ email: 'human@being.com', password: 'humanbeing' })
        .end((err, res) => {
          chai.request(app)
            .post('/todo')
            .set('authorization', `Bearer ${res.body.token}`) // get valid token
            .send(todo)
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(201);
              expect(res.body).to.have.property('todoId');
              done();
            });
        });
    });
  });

  describe('Get Todos', () => {
    it('should fail to return the todo(s) if "authorization" is not set in the request header', (done) => {
      chai.request(app)
        .get('/todo')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirect;
          expect(res.req.path).to.be.eq('/login');
          done();
        });
    });

    it('should fail to return the todo(s) if "authorization" in the req header is invalid', (done) => {
      chai.request(app)
        .get('/todo')
        .set('authorization', 'Bearer')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirect;
          expect(res.req.path).to.be.eq('/login');
          done();
        });
    });

    it('should fail to return the todo(s) if the authorization token is invalid', (done) => {
      chai.request(app)
        .get('/todo')
        .set('authorization', 'Bearer invalidToken')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirect;
          expect(res.req.path).to.be.eq('/login');
          done();
        });
    });

    it('should fail to return the todo(s) if the user id generated from the authorization token does not exist', (done) => {
      chai.request(app)
        .get('/todo')
        .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjZmJjYjIwLTA4ZTEtMTFlOS05MWZlLTlmMzg0M2Q5NDdmZCIsInVzZXJuYW1lIjoiY2xpbnRvbmFtZSIsImVtYWlsIjoibmt3b2NoYWNsaW50b25AZ21haWwuY29tYW1lIiwiaWF0IjoxNTQ1ODA5OTYzfQ.PhMNI57KYploKDfLqdx0Coije0mNaNq_5eBb7AVQkyI')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirect;
          expect(res.req.path).to.be.eq('/login');
          done();
        });
    });

    it('should not return any todo if the user does not have any', (done) => {
      chai.request(app)
        .post('/signup')
        .send({
          username: 'animal', email: 'animal@being.com', password: 'animalbeing', password2: 'animalbeing'
        })
        .end((err, res) => {
          chai.request(app)
            .get('/todo')
            .set('authorization', `Bearer ${res.body.token}`) // get valid token
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              expect(res.body.message).to.be.eq('You have no todo.');
              done();
            });
        });
    });

    it('should return all the todos for the user', (done) => {
      chai.request(app)
        .post('/login')
        .send({ email: 'human@being.com', password: 'humanbeing' })
        .end((err, res) => {
          const { token } = res.body;
          chai.request(app)
            .get('/todo')
            .set('authorization', `Bearer ${token}`)
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              expect(res.body).to.have.property('todos');
              done();
            });
        });
    });
  });
});
