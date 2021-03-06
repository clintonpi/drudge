/* eslint-disable no-unused-expressions */
const chai = require('chai');
const chaiHTTP = require('chai-http');
const pool = require('../db/index');
const app = require('../app');

const { expect } = chai;

chai.use(chaiHTTP);

describe('Todo Actions', () => {
  const user = { email: 'human@being.com', password: 'humanbeing' };

  before((done) => {
    pool.query('DELETE FROM todos;')
      .catch((error) => {
        throw error.stack;
      });

    chai.request(app)
      .post('/signup')
      .send({ username: 'Human', ...user, password2: 'humanbeing' })
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
        .send(user)
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
        .send(user)
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
        .send(user)
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
        .send(user)
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
        .send(user)
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

  describe('Update Todo', () => {
    let todo;

    beforeEach((done) => {
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          chai.request(app)
            .get('/todo')
            .set('authorization', `Bearer ${res.body.token}`)
            .end((err, res) => {
              const firstTodo = res.body.todos[0];
              todo = {
                todoId: firstTodo.id,
                todoName: firstTodo.name,
                isDone: firstTodo.done
              };
              done();
            });
        });
    });

    it('should fail to update the todo if "authorization" is not set in the request header', (done) => {
      chai.request(app)
        .put('/todo')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirect;
          expect(res.req.path).to.be.eq('/login');
          done();
        });
    });

    it('should fail to update the todo if "authorization" in the req header is invalid', (done) => {
      chai.request(app)
        .put('/todo')
        .set('authorization', 'Bearer')
        .send(todo)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirect;
          expect(res.req.path).to.be.eq('/login');
          done();
        });
    });

    it('should fail to update the todo if the authorization token is invalid', (done) => {
      chai.request(app)
        .put('/todo')
        .set('authorization', 'Bearer invalidToken')
        .send(todo)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirect;
          expect(res.req.path).to.be.eq('/login');
          done();
        });
    });

    it('should fail to update the todo if the user id generated from the authorization token does not exist', (done) => {
      chai.request(app)
        .put('/todo')
        .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjZmJjYjIwLTA4ZTEtMTFlOS05MWZlLTlmMzg0M2Q5NDdmZCIsInVzZXJuYW1lIjoiY2xpbnRvbmFtZSIsImVtYWlsIjoibmt3b2NoYWNsaW50b25AZ21haWwuY29tYW1lIiwiaWF0IjoxNTQ1ODA5OTYzfQ.PhMNI57KYploKDfLqdx0Coije0mNaNq_5eBb7AVQkyI')
        .send(todo)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirect;
          expect(res.req.path).to.be.eq('/login');
          done();
        });
    });

    it('should fail to update the todo if "todoName" was not sent', (done) => {
      todo.todoName = undefined;
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          chai.request(app)
            .put('/todo')
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

    it('should fail to update the todo if "todoName" was not a string', (done) => {
      todo.todoName = 1;
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          chai.request(app)
            .put('/todo')
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

    it('should fail to update the todo if the length of the sanitized todoname is less than one', (done) => {
      todo.todoName = '      ';
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          chai.request(app)
            .put('/todo')
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

    it('should fail to update the todo if "todoId" was not sent', (done) => {
      todo.todoId = undefined;
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          chai.request(app)
            .put('/todo')
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

    it('should fail to update the todo if "isDone" was not sent', (done) => {
      todo.isDone = undefined;
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          chai.request(app)
            .put('/todo')
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

    it('should fail to update the todo if "isDone" is not a boolean', (done) => {
      todo.isDone = 'invalidStatus';
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          chai.request(app)
            .put('/todo')
            .set('authorization', `Bearer ${res.body.token}`) // get valid token
            .send(todo)
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(400);
              expect(res.body.message).to.be.eq('Your todo status was invalid.');
              done();
            });
        });
    });

    it('should fail to update the todo if the todoId is not a valid UUID', (done) => {
      todo.todoId = '0105ded0'; // Inalid uuid
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          chai.request(app)
            .put('/todo')
            .set('authorization', `Bearer ${res.body.token}`) // get valid token
            .send(todo)
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(400);
              expect(res.body.message).to.be.eq('Your request was invalid.');
              done();
            });
        });
    });

    it('should fail to update the todo if it does not exist', (done) => {
      todo.todoId = '0105ded0-1536-11e9-a23f-57af3506ee08'; // Valid uuid
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          chai.request(app)
            .put('/todo')
            .set('authorization', `Bearer ${res.body.token}`) // get valid token
            .send(todo)
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(400);
              expect(res.body.message).to.be.eq('This todo does not exist.');
              done();
            });
        });
    });

    it('should fail to update the todo if it was not created by this user', (done) => {
      chai.request(app)
        .post('/login')
        .send({ email: 'animal@being.com', password: 'animalbeing' })
        .end((err, res) => {
          chai.request(app)
            .put('/todo')
            .set('authorization', `Bearer ${res.body.token}`) // get valid token
            .send(todo)
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(400);
              expect(res.body.message).to.be.eq('You are not the owner of this todo.');
              done();
            });
        });
    });

    it('should update the todo', (done) => {
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          chai.request(app)
            .put('/todo')
            .set('authorization', `Bearer ${res.body.token}`) // get valid token
            .send(todo)
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              done();
            });
        });
    });
  });

  describe('Delete Todo', () => {
    let todosId;

    beforeEach((done) => {
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          chai.request(app)
            .get('/todo')
            .set('authorization', `Bearer ${res.body.token}`)
            .end((err, res) => {
              todosId = [];
              res.body.todos.forEach((todo) => {
                todosId.push(todo.id);
              });
              done();
            });
        });
    });

    it('should fail to delete the todo(s) if "authorization" is not set in the request header', (done) => {
      chai.request(app)
        .delete('/todo')
        .send({ todosId })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirect;
          expect(res.req.path).to.be.eq('/login');
          done();
        });
    });

    it('should fail to delete the todo(s) if "authorization" in the req header is invalid', (done) => {
      chai.request(app)
        .delete('/todo')
        .set('authorization', 'Bearer')
        .send({ todosId })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirect;
          expect(res.req.path).to.be.eq('/login');
          done();
        });
    });

    it('should fail to delete the todo(s) if the authorization token is invalid', (done) => {
      chai.request(app)
        .delete('/todo')
        .set('authorization', 'Bearer invalidToken')
        .send({ todosId })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirect;
          expect(res.req.path).to.be.eq('/login');
          done();
        });
    });

    it('should fail to delete the todo(s) if the user id generated from the authorization token does not exist', (done) => {
      chai.request(app)
        .delete('/todo')
        .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjZmJjYjIwLTA4ZTEtMTFlOS05MWZlLTlmMzg0M2Q5NDdmZCIsInVzZXJuYW1lIjoiY2xpbnRvbmFtZSIsImVtYWlsIjoibmt3b2NoYWNsaW50b25AZ21haWwuY29tYW1lIiwiaWF0IjoxNTQ1ODA5OTYzfQ.PhMNI57KYploKDfLqdx0Coije0mNaNq_5eBb7AVQkyI')
        .send({ todosId })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirect;
          expect(res.req.path).to.be.eq('/login');
          done();
        });
    });

    it('should fail to delete the todo(s) if "todosId" was not sent', (done) => {
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          chai.request(app)
            .delete('/todo')
            .set('authorization', `Bearer ${res.body.token}`) // get valid token
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(400);
              expect(res.body.message).to.be.eq('Your request was incomplete.');
              done();
            });
        });
    });

    it('should fail to delete the todo(s) if "todosId" was not an array', (done) => {
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          chai.request(app)
            .delete('/todo')
            .set('authorization', `Bearer ${res.body.token}`) // get valid token
            .send({ todosId: 1 })
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(400);
              expect(res.body.message).to.be.eq('Your request was invalid.');
              done();
            });
        });
    });

    it('should fail to delete the todo(s) if the length of "todosId" array is less than one', (done) => {
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          chai.request(app)
            .delete('/todo')
            .set('authorization', `Bearer ${res.body.token}`) // get valid token
            .send({ todosId: [] })
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(400);
              expect(res.body.message).to.be.eq('Your request was invalid.');
              done();
            });
        });
    });

    it('should fail to delete the todo if the/any todoId is not a valid UUID', (done) => {
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          chai.request(app)
            .delete('/todo')
            .set('authorization', `Bearer ${res.body.token}`) // get valid token
            .send({ todosId: '0105ded0' })
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(400);
              expect(res.body.message).to.be.eq('Your request was invalid.');
              done();
            });
        });
    });

    it('should fail to delete a todo if it does not exist', (done) => {
      todosId = ['0105ded0-1536-11e9-a23f-57af3506ee08'];
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          chai.request(app)
            .delete('/todo')
            .set('authorization', `Bearer ${res.body.token}`) // get valid token
            .send({ todosId })
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(400);
              expect(res.body.message).to.be.eq('This todo does not exist.');
              done();
            });
        });
    });

    it('should fail to delete the todos if any of them does not exist', (done) => {
      todosId.push('0105ded0-1536-11e9-a23f-57af3506ee08');
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          chai.request(app)
            .delete('/todo')
            .set('authorization', `Bearer ${res.body.token}`) // get valid token
            .send({ todosId })
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(400);
              expect(res.body.message).to.be.eq('Some of these todos do not exist.');
              done();
            });
        });
    });

    it('should fail to delete a todo if it was not created by this user', (done) => {
      chai.request(app)
        .post('/login')
        .send({ email: 'animal@being.com', password: 'animalbeing' })
        .end((err, res) => {
          chai.request(app)
            .delete('/todo')
            .set('authorization', `Bearer ${res.body.token}`) // get valid token
            .send({ todosId })
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(400);
              expect(res.body.message).to.be.eq('You are not the owner of this todo.');
              done();
            });
        });
    });

    it('should fail to delete the todos if any of them was not created by this user', (done) => {
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          chai.request(app)
            .post('/todo') // create one more todo
            .set('authorization', `Bearer ${res.body.token}`) // get valid token
            .send({ todoName: 'Do something else' })
            .end((err, res) => {
              const { todoId } = res.body;
              todosId.push(todoId);
              // add the gotten todo id to todosId to make the length greater than one
              chai.request(app)
                .post('/login') // login as another user
                .send({ email: 'animal@being.com', password: 'animalbeing' })
                .end((err, res) => {
                  chai.request(app)
                    .delete('/todo')
                    .set('authorization', `Bearer ${res.body.token}`) // get valid token
                    .send({ todosId })
                    .end((err, res) => {
                      expect(err).to.be.null;
                      expect(res).to.have.status(400);
                      expect(res.body.message).to.be.eq('You are not the owner of some of these todos.');
                      done();
                    });
                });
            });
        });
    });

    it('should delete the todo(s)', (done) => {
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          chai.request(app)
            .delete('/todo')
            .set('authorization', `Bearer ${res.body.token}`) // get valid token
            .send({ todosId })
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              done();
            });
        });
    });
  });
});
