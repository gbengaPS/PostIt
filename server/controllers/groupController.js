import { validateInput, getId } from '../includes/functions';

const Groups = require('../models').groups;
const Users = require('../models').users;
const Messages = require('../models').messages;
const Members = require('../models').groupMembers;

export const create = (req, res) => {
  const requiredFields = ['groupName', 'groupDescription'];
  if (validateInput(req.body, requiredFields) === 'ok') {
    Groups.create({
      groupName: req.body.groupName,
      groupDescription: req.body.groupDescription,
      createdBy: getId(req.headers['x-access-token']),

    })
    .then((group) => {
      Members.create({
        groupId: group.id,
        userId: getId(req.headers['x-access-token']),
        addedBy: getId(req.headers['x-access-token']),
      })
      .then(() => {
        const groupData = {
          groupId: group.id,
          groupName: group.groupName,
          groupDescription: group.groupDescription,
        };
        res.status(201).send({ group: groupData });
      })
      .catch((error) => {
        res.status(400).json(error);
      });
    })
    .catch((error) => {
      const data = {
        error: error.errors,
        message: 'Could not create group',
      };
      res.status(401).send(data);
    });
  } else {
    res.status(400).json({ message: validateInput(req.body, requiredFields) });
  }
}; // end of Create

export const addMembers = (req, res) => {
  const requiredFields = ['userId'];
  const inputValidation = validateInput(req.body, requiredFields);
  if (inputValidation === 'ok') {
    Members.findOne({
      where: { userId: req.body.userId, groupId: req.params.groupId },
    })
    .then((member) => {
      if (member) {
        res.status(400).json({ error: 'User already a member of this group', member });
      } else {
        Members.create({
          groupId: req.params.groupId,
          userId: req.body.userId,
          addedBy: getId(req.headers['x-access-token']),
        })
        .then((groupMember) => {
          res.json({ member: groupMember, message: 'User successfully added to group' });
        })
        .catch((error) => {
          res.json({ error: error.message, message: 'Could not add user to group' });
        });
      }
    })
    .catch((error) => {
      res.status(401).json({ error: error.message, message: 'Could not find user' });
    });
  }
  // } else {
  //   res.status(400).json({ error: inputValidation, message: 'Parameter not well sturcutred' });
  // }
}; // end of addMembers

export const getGroups = (req, res) => {
  const userId = getId(req.headers['x-access-token']);
  Users.find({
    where: { id: userId },
    attributes: {
      exclude: ['password', 'createdAt', 'updatedAt'],
    },
    include: [
      {
        model: Groups,
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
        include: [
          {
            model: Messages,
            attributes: {
              exclude: ['createdAt', 'updatedAt'],
            },
          },
        ], // end of Group include
        through: { attributes: [] },
      },
    ],
    order: [
      [Groups, 'id', 'DESC'],
    ],
  })
  .then((groups) => {
    res.json(groups);
  })
  .catch((error) => {
    res.json(error);
  });
};

export const leaveGroup = (req, res) => {
  const userId = getId(req.headers['x-access-token']);
  const groupId = req.params.groupId;
  Members.findOne({
    where: { userId, groupId },
  })
  .then((member) => {
    if (member) {
      Members.destroy({
        where: { userId, groupId },
      })
      .then(() => {
        res.json({ message: 'User left group' });
      })
      .catch((error) => {
        res.status(400).json(error);
      });
    } else {
      res.status(400).json({ error: 'User not a member of the group' });
    }
  })
  .catch((error) => {
    res.status(400).json(error);
  });
};
export const getGroupMembers = (req, res) => {
  const requiredFields = ['groupId'];
  const inputValidationResponse = validateInput(req.params, requiredFields);
  if (inputValidationResponse === 'ok' && !isNaN(req.params.groupId)) {
    Groups.find({
      where: { id: req.params.groupId },
    })
    .then((foundGroup) => {
      foundGroup.getUsers({ attributes: {
        exclude: ['password', 'createdAt', 'updatedAt'],
      },
      })
      .then((users) => {
        res.json({ users, group: foundGroup });
      })
      .catch(() => {
      });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
  } else {
    res.status(400).json({ error: inputValidationResponse });
  }
};
