import { assert } from 'chai';
import supertest from 'supertest';
import app from '../server/app';
import testInclude from './tests.includes';

const data2 = { fullName: 'gbenga Oyetade', username: 'apptest2', password: 'some password', email: 'apptest2@gmail.com', phoneNumber: '+22348064140695' };
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjozLCJpYXQiOjE1MDUwNzY0NjEsImV4cCI6MTUzNjYxMjQ2MX0.omL5OG_IPewasCg0GweT5Xg3WbpL7f4FrWu2d6qYstM';

describe('Signup tests', () => {
  before(() => {
    testInclude();
  });
  it('signup post url should be defined', (done) => {
    supertest(app).post('/api/user/signup').send().end((err, res) => {
      assert.equal(res.statusCode, 401);
      done();
    });
  });
  it('should validate input parameters are well structred', (done) => {
    supertest(app).post('/api/user/signup').send(data2).end((err, res) => {
      assert.equal(res.body.parameters, 'ok');
      done();
    });
  });
  it('should detect invalid email address', (done) => {
    const wrongEmail = { fullName: 'gbenga Oyetade', username: 'apptest', password: 'some password', email: 'apptestgmail.com', phoneNumber: '+2348064140695' };
    supertest(app).post('/api/user/signup').send(wrongEmail).end((err, res) => {
      assert.equal(res.body.error, 'Invalid email address supplied');
      done();
    });
  });
  it('should make sure password parameter is at least 6 characters', (done) => {
    const user = { fullName: 'gbenga Oyetade', username: 'gbenga_ps', password: 'pass', email: 'ioyetade@gmail.com', phoneNumber: '+2348064140695' };
    supertest(app).post('/api/user/signup').send(user).end((err, res) => {
      assert.equal(res.body.error, 'Password must be at least 6 characters');
      done();
    });
  });
  it('should detect if username contains special characters', (done) => {
    const user = { fullName: 'gbenga Oyetade', username: '$gbenga_ps', password: 'password', email: 'ioyetade2@gmail.com', phoneNumber: '+2348064140695' };
    supertest(app).post('/api/user/signup').send(user).end((err, res) => {
      assert.equal(res.body.error, 'Username cannot contain special characters aside from _');
      done();
    });
  });
  it('should sign user up if parameters are well structured', (done) => {
    const user = { fullName: 'gbenga Oyetade', username: 'test_signup', password: 'password', email: 'test_signup@gmail.com', phoneNumber: '+234806414069533' };
    supertest(app).post('/api/user/signup').send(user).end((err, res) => {
      assert.isOk(res.body.user.token);
      done();
    });
  });
});

// Test for the group controller
describe('group test', () => {
  it('Create group route should be defined ', (done) => {
    supertest(app).post('/api/group').set('x-access-token', token).send()
    .end((err, res) => {
      assert.equal(res.body.message, 'groupName field not provided');
      done();
    });
  });
  it('Leave group should detect if group exist', (done) => {
    supertest(app).delete('/api/group/10789/user').set('x-access-token', token).send()
    .end((err, res) => {
      assert.equal(res.body.error, 'Group does not exist');
      done();
    });
  });
  it('Leave group should detect if user belongs to group', (done) => {
    supertest(app).delete('/api/group/2/user').set('x-access-token', token).send()
    .end((err, res) => {
      assert.equal(res.body.error, 'User not a member of the group');
      done();
    });
  });
  it('Should detect if groupName field is not provided', (done) => {
    supertest(app).post('/api/group').set('x-access-token', token).send()
    .end((err, res) => {
      assert.equal(res.body.message, 'groupName field not provided');
      done();
    });
  });
  it('Should detect empty groupName', (done) => {
    const groupData = { groupName: '  ', groupDescription: '' };
    supertest(app).post('/api/group').set('x-access-token', token).send(groupData)
    .end((err, res) => {
      assert.equal(res.body.error[0].message, 'Group name cannot be empty');
      done();
    });
  });
  it('Should detect if group description field is not provided', (done) => {
    const groupData = { groupName: 'react leaders' };
    supertest(app).post('/api/group').set('x-access-token', token).send(groupData)
    .end((err, res) => {
      assert.equal(res.body.message, 'groupDescription field not provided');
      done();
    });
  });
  it('Add member function should be defined', (done) => {
    const groupData = {};
    supertest(app).post('/api/group/1/user').set('x-access-token', token).send(groupData).end((err, res) => {
      assert.equal(res.statusCode, 400);
      assert.isOk(res.body.error);
      done();
    });
  });
  it('Add member should add member to a group if conditions are satisfactory', (done) => {
    const groupData = { userId: 1 };
    supertest(app).post('/api/group/1/user').set('x-access-token', token).send(groupData)
    .end((err, res) => {
      assert.equal(res.body.message, 'User successfully added to group');
      assert.isOk(res.body.member);
      done();
    });
  });
  it('Add member should detect if user is already a member of the group', (done) => {
    const groupData = { userId: 1 };
    supertest(app).post('/api/group/1/user').set('x-access-token', token).send(groupData)
    .end((err, res) => {
      assert.equal(res.body.error, 'User already a member of this group');
      done();
    });
  });
  it('getGroupMembers should return group members', (done) => {
    supertest(app).get('/api/group/1/users').set('x-access-token', token).send()
    .end((err, res) => {
      assert.isOk(res.body.users);
      assert.equal(res.statusCode, 200);
      done();
    });
  });
  it('leave group should remove user from group if he belongs to the group', (done) => {
    supertest(app).delete('/api/group/1/user').set('x-access-token', token).send()
    .end((err, res) => {
      assert.isOk(res.body.message);
      assert.equal(res.statusCode, 200);
      done();
    });
  });
  it('leave group should detect if user is a member of the group', (done) => {
    supertest(app).delete('/api/group/2/user').set('x-access-token', token).send()
    .end((err, res) => {
      assert.isOk(res.body.error);
      assert.equal(res.statusCode, 400);
      done();
    });
  });
  // it('should detect if groupId is not a number', (done) => {
  //   const groupData = { userId: 1 };
  //   supertest(app).post('/api/group/r/user').set('x-access-token', token).send(groupData).end((err, res) => {
  //     assert.equal(res.body.error, 'groupId or userId not a number');
  //     done();
  //   });
  // });
});

// Login tests
describe('Login', () => {
  it('should detect if parameters are correct', (done) => {
    supertest(app).post('/api/user/signin').send().end((err, res) => {
      assert.isOk(res.body.error);
      assert.equal(res.statusCode, 400);
      done();
    });
  });
  it('Return 401 error if user does not exist', (done) => {
    const user = {
      username: 'does not exist',
      password: 'password',
    };
    supertest(app).post('/api/user/signin').send(user).end((err, res) => {
      assert.equal(res.statusCode, 401);
      done();
    });
  });
  it('Return a token on successful login', (done) => {
    const data = {
      username: 'apptest', password: 'some password',
    };
    supertest(app).post('/api/user/signin').send(data).end((err, res) => {
      assert.isOk(res.body.token);
      done();
    });
  });
});

// reset password tests

describe('Reset password', () => {
  it('Should detect if email was provided', (done) => {
    supertest(app).post('/api/user/password_reset').send().end((err, res) => {
      assert.equal(res.body.message, 'Parameter not well structured');
      assert.isOk(res.body.error);
      assert.equal(res.statusCode, 400);
      done();
    });
  });
  it('Should detect if provided email exists', (done) => {
    const email = { email: 'something@gmail.com' };
    supertest(app).post('/api/user/password_reset').send(email).end((err, res) => {
      assert.equal(res.body.error, 'Email address does not exist on Postit');
      assert.equal(res.statusCode, 401);
      done();
    });
  });
});

// update password tests
describe('Update password', () => {
  it('should detect if the password field was provided', (done) => {
    supertest(app).post('/api/user/password_update').send().end((err, res) => {
      assert.isOk(res.body.error);
      assert.equal(res.statusCode, 400);
    });
    done();
  });
  it('should detect if url contains token', (done) => {
    const password = { password: 'password' };
    supertest(app).post('/api/user/password_update').send(password).end((err, res) => {
      assert.equal(res.body.error, 'No token provided');
      assert.equal(res.statusCode, 401);
    });
    done();
  });
  it('should verify token if provided', (done) => {
    const password = { password: 'password' };
    supertest(app).post('/api/user/password_update?token=whatever').send(password).end((err, res) => {
      assert.equal(res.body.error, 'Token authentication failure');
      assert.equal(res.statusCode, 401);
    });
    done();
  });
});
// Message test

// General Application tests
describe('General tests', () => {
  it('Undefined GET urls should return 404 statusCode', (done) => {
    supertest(app).get('/whatever').send().end((err, res) => {
      assert.equal(res.statusCode, 404);
      done();
    });
  });
  it('Undefined POST urls should return 404 statusCode', (done) => {
    supertest(app).post('/whatever').send().end((err, res) => {
      assert.equal(res.statusCode, 404);
      done();
    });
  });
  it('Undefined POST urls should return a message', (done) => {
    supertest(app).post('/whatever').send().end((err, res) => {
      assert.isOk(res.body.message);
      done();
    });
  });
});
describe('Authenticate', () => {
  it('should detect if token is not provided', (done) => {
    supertest(app).get('/api/group').send().end((err, res) => {
      assert.equal(res.body.message, 'No token provided');
      done();
    });
  });
  it('should detect if token is invalid', (done) => {
    supertest(app).get('/api/group').set('x-access-token', 'invalid token').send().end((err, res) => {
      assert.equal(res.body.message, 'Token authentication failure');
      done();
    });
  });
});
