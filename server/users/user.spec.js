/* eslint-disable no-unused-expressions */
const chai = require('chai');
const chaiHTTP = require('chai-http');
const isEmail = require('validator/lib/isEmail');
const pool = require('../db/index');
const app = require('../app');
const sanitizeStr = require('../../utils');

const { expect } = chai;

chai.use(chaiHTTP);

describe('User Actions', () => {
  before((done) => {
    pool.query('DELETE FROM users;')
      .catch((error) => {
        throw error.stack;
      })
      .then(() => done());
  });

  describe('User Signup', () => {
    let newUser;

    beforeEach(() => {
      newUser = {
        username: 'Human',
        email: 'human@being.com',
        password: 'humanbeing',
        password2: 'humanbeing'
      };
    });

    it('should return a signup page', (done) => {
      chai.request(app)
        .get('/signup')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.type).to.eq('text/html');
          done();
        });
    });

    // Add user for upcomming tests instead of using pool
    it('should register a new user', (done) => {
      chai.request(app)
        .post('/signup')
        .send(newUser)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('token');
          expect(res.body.user.username).to.be.eq(sanitizeStr(newUser.username));
          expect(isEmail(res.body.user.email)).to.be.true;
          done();
        });
    });

    it('should fail to signup if "username" was not sent', (done) => {
      newUser.username = undefined;
      chai.request(app)
        .post('/signup')
        .send(newUser)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.eq('Your request was incomplete.');
          done();
        });
    });

    it('should fail to signup if "email" was not sent', (done) => {
      newUser.email = undefined;
      chai.request(app)
        .post('/signup')
        .send(newUser)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.eq('Your request was incomplete.');
          done();
        });
    });

    it('should fail to signup if "password" was not sent', (done) => {
      newUser.password = undefined;
      chai.request(app)
        .post('/signup')
        .send(newUser)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.eq('Your request was incomplete.');
          done();
        });
    });

    it('should fail to signup if "password2" was not sent', (done) => {
      newUser.password2 = undefined;
      chai.request(app)
        .post('/signup')
        .send(newUser)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.eq('Your request was incomplete.');
          done();
        });
    });


    it('should fail to signup if "username" was not a string', (done) => {
      newUser.username = 54;
      chai.request(app)
        .post('/signup')
        .send(newUser)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.eq('Your username was invalid.');
          done();
        });
    });

    it('should fail to signup if the length of the sanitized username is less than 1', (done) => {
      newUser.username = '  ';
      chai.request(app)
        .post('/signup')
        .send(newUser)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.eq('Your username was invalid.');
          done();
        });
    });

    it('should fail to signup if the length of the sanitized username is greater than 50', (done) => {
      newUser.username = 'aConfusedHumanWithAnUnnecessarilyLongAndVeryInvalidUserName';
      chai.request(app)
        .post('/signup')
        .send(newUser)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.eq('Your username was invalid.');
          done();
        });
    });

    it('should fail to signup if "email" is not an email address', (done) => {
      newUser.email = 'human@confused.1';
      chai.request(app)
        .post('/signup')
        .send(newUser)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.eq('Your email address was invalid.');
          done();
        });
    });

    it('should fail to signup if the length of "password" is less than 8', (done) => {
      newUser.password = 'pass';
      chai.request(app)
        .post('/signup')
        .send(newUser)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.eq('The password you chose to use was invalid.');
          done();
        });
    });

    it('should fail to signup if the length of "password" is greater than 4000', (done) => {
      newUser.password = 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Autem totam ipsa, excepturi illo quos ut est? Maiores maxime dolores sit soluta totam doloremque non amet veritatis culpa. Labore minima, possimus ut repellat quae explicabo blanditiis mollitia qui temporibus. Ipsum, ullam, ex illo eos corrupti reiciendis est placeat tenetur soluta magni doloribus ab aut voluptate facere distinctio ducimus dolorum accusantium quidem dolor velit repellendus, laborum in officia. Eaque obcaecati veniam saepe nulla explicabo, sunt quidem sequi suscipit quam adipisci magnam aliquid voluptatibus recusandae ducimus ratione, ut iure fugiat deserunt placeat numquam provident, laborum alias. Earum sunt delectus dolor, alias deleniti laudantium asperiores perferendis, vitae nesciunt maxime voluptates ab repellat ipsa cum. Alias temporibus similique beatae enim tenetur inventore dolores, natus rem atque sapiente veniam. Hic vero, explicabo aspernatur voluptate deleniti excepturi odio corporis accusantium cum voluptatem tenetur obcaecati saepe similique provident illum repudiandae quos dignissimos doloribus animi eveniet vel aliquid repellat! Deserunt quam officiis id facere est odit! Quis perferendis quia earum deserunt porro rerum perspiciatis sequi ab doloribus? Quis pariatur ducimus dolorem repellat deleniti consequuntur doloremque, tempore sed eveniet nesciunt tempora minus voluptatibus voluptatum beatae nisi eligendi vero mollitia quibusdam officiis praesentium cupiditate, non quisquam, velit ipsum. Quo earum ipsam dolor cumque quos expedita placeat provident eos aliquid quas sapiente deleniti, quidem eveniet repellendus temporibus assumenda tempora molestiae quibusdam, porro eius nihil atque explicabo. Doloremque id delectus debitis quos repellendus tenetur voluptatum nesciunt. Neque corporis animi ducimus aspernatur nesciunt ad, nobis nisi possimus quis unde quod veniam velit assumenda ratione quos reprehenderit placeat ab a quae? Dolorum iure necessitatibus labore cum magnam corporis harum, fugiat esse commodi! Consequuntur laborum saepe sapiente dignissimos minus iste, molestias minima odit velit molestiae eligendi maxime nam nobis maiores voluptates quia cum rerum qui fugit nostrum id doloremque deserunt quas perspiciatis! Atque assumenda molestias eos totam? Sunt amet quibusdam nostrum obcaecati quod? Culpa, ea atque aspernatur laboriosam soluta error iste veniam voluptas odit numquam minima? Harum, nulla sequi saepe asperiores maxime tenetur voluptas rem itaque eos aperiam sed doloremque sunt totam corporis voluptates pariatur distinctio corrupti ipsam laboriosam molestias dolores aliquam ex quibusdam! Expedita ipsam, distinctio repellat similique corrupti sed alias voluptatibus sit optio sunt sapiente ipsa minima, quam velit! Sapiente voluptatibus fuga nisi iure placeat? Nam nihil, totam doloremque provident, aspernatur quia est repellat eaque iusto sunt officia ducimus delectus tempore, voluptatem vitae obcaecati tempora ad aliquid numquam a? Molestias sit iste, quia veritatis facere, id repudiandae quae voluptas nam officia voluptatem voluptate eum? Perspiciatis, fugit? Iure, assumenda exercitationem enim perspiciatis veniam quas eius iusto rem nihil amet pariatur commodi alias saepe numquam accusamus. Nihil dolore facilis iure et. Quo libero recusandae ullam ratione reprehenderit nemo vitae laborum aut, aperiam eaque qui nulla pariatur hic illum, harum mollitia atque? Velit voluptas quisquam est cupiditate assumenda, ullam inventore sunt culpa nihil vero vitae cumque repellendus magnam natus beatae, commodi fugit. Ducimus architecto libero quas at ipsum distinctio optio perferendis est nihil nemo minus praesentium ullam, iure nisi? Rem modi fugit, porro quis a, aspernatur adipisci repellendus odit deserunt quod officia eos. Suscipit voluptas recusandae nihil mollitia molestiae obcaecati provident saepe debitis officia modi voluptates totam sit, odit dolores hic veniam fugiat fugit eveniet consequatur perferendis velit! Asperiores reiciendis eum eius ducimus labore reprehenderit vero iusto ipsa eaque rerum amet deleniti, ipsum suscipit nulla facilis. Ea.';
      chai.request(app)
        .post('/signup')
        .send(newUser)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.eq('The password you chose to use was invalid.');
          done();
        });
    });

    it('should fail to signup if "password" and "password2" are not equal', (done) => {
      newUser.password = 'password';
      newUser.password2 = 'password2';
      chai.request(app)
        .post('/signup')
        .send(newUser)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.eq('The password you chose to use was invalid.');
          done();
        });
    });

    it('should fail to signup if users/a user with this username or/and email address already exist(s)', (done) => {
      chai.request(app)
        .post('/signup')
        .send(newUser) // resend with the same username and email address
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.eq('Users/a user with this username or/and email address already exists.');
          done();
        });
    });

    it('should fail to signup if a user with this username already exist', (done) => {
      newUser.email = 'animal@being.com';
      chai.request(app)
        .post('/signup')
        .send(newUser)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.eq('A user with this username already exists.');
          done();
        });
    });

    it('should fail to signup if a user with this email address already exist', (done) => {
      newUser.username = 'Animal';
      chai.request(app)
        .post('/signup')
        .send(newUser)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.eq('A user with this email address already exists.');
          done();
        });
    });

    // --------------------------------------------------------------------------
    // This server error is caught my the UserValidator.js and no server error
    // created by this app can get to UserController.js. So pool's/pg's errors
    // can't be completely tested from this app.
    // --------------------------------------------------------------------------
    /*
    it('should fail to signup there was a server error', (done) => {
      pool.query('DROP TABLE users CASCADE;') // cause a server error
        .then(() => {
          chai.request(app)
            .post('/signup')
            .send(newUser)
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(500);
              expect(res.body.message).to.be.eq('There was an error while
              processing your request.');
            });
        })
        .catch((error) => {
          throw error.stack;
        })
        .then(() => {
          pool.query('CREATE TABLE users(id UUID PRIMARY KEY, username VARCHA
          (50) UNIQUE NOT NULL, email VARCHAR(320) UNIQUE NOT NULL, password
          VARCHAR(4000) NOT NULL, registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW());')
            .catch((error) => {
              throw error.stack;
            })
            .then(() => {
              done();
            });
        });
    });
    */
  });

  describe('User Login', () => {
    let user;

    beforeEach(() => {
      user = {
        email: 'human@being.com',
        password: 'humanbeing'
      };
    });

    it('should return a login page', (done) => {
      chai.request(app)
        .get('/login')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.type).to.be.eq('text/html');
          done();
        });
    });

    it('should fail to login if "email" is not sent', (done) => {
      user.email = undefined;
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.eq('Your request was incomplete');
          done();
        });
    });

    it('should fail to login if "password" is not sent', (done) => {
      user.password = undefined;
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.eq('Your request was incomplete');
          done();
        });
    });

    it('should fail to login if the user does not exist', (done) => {
      user.email = 'animal@being.com';
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.eq('This user does not exist.');
          done();
        });
    });

    it('should fail to login if the password given was incorrect', (done) => {
      user.password = 'wrongPassword';
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.eq('Your password was incorrect.');
          done();
        });
    });

    it('should login the user', (done) => {
      chai.request(app)
        .post('/login')
        .send(user)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          expect(res.body.user).to.have.property('username');
          expect(res.body.user).to.have.property('email');
          done();
        });
    });
  });
});
