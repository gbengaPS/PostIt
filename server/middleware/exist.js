import database from '../models/index';
import { checkParams, getId } from '../includes/helperFunctions';

const Users = database.users;
const Groups = database.groups;

/**
 * @description Check to see if user and group exists
 *
 * @param { object } req -request object
 * @param { object } res -response object
 * @param { function } next -function to call next route
 *
 * @returns { void } -returns nothing
 */
export const groupAndUserExist = (req, res, next) => {
  const groupId = req.params.groupId;
  const userId = req.body.userId || req.params.userId;
  const requiredFields = ['userId'];
  const validateInputResponse = checkParams(req.body, requiredFields);
  if (validateInputResponse !== 'ok') {
    res.status(400).json({ error: validateInputResponse });
  } else if (isNaN(groupId) || isNaN(userId)) {
    res.status(400).json({ error: 'groupId or userId not a number' });
  } else {
    Groups.findOne({
      where: { id: groupId },
    })
    .then((group) => {
      if (group) {
        Users.findOne({
          where: { id: userId },
        })
        .then((user) => {
          if (user) {
            next();
          } else {
            res.status(400).json({ error: 'User does not exist' });
          }
        })
        .catch((error) => {
          res.status(400).json({ error, message: 'user error' });
        });
      } else {
        res.status(400).json({ error: 'Group does not exist' });
      }
    })
    .catch((error) => {
      res.status(400).json({ error: error.message });
    });
  }
};

/**
 * @description Checks to see if group exists
 *
 * @param { object } req -request object
 * @param { object } res -response object
 * @param { function } next -next
 *
 * @returns { void } -returns nothing
 */
export const groupExist = (req, res, next) => {
  const groupId = req.params.groupId;
  if (!isNaN(groupId)) {
    Groups.findOne({
      where: { id: groupId },
    })
  .then((group) => {
    if (group) {
      const userId = getId(req.headers['x-access-token']);
      database.groupMembers.findOne({
        where: { userId, groupId },
      })
      .then((member) => {
        if (member) {
          next();
        } else {
          res.status(401).json({ error: 'User not a member of the group' });
        }
      })
      .catch(() => {
      });
    } else {
      res.status(400).json({ error: 'Group does not exist' });
    }
  })
  .catch((error) => {
    res.status(500).json(error.message);
  });
  } else {
    res.status(400).json({ error: 'groupId is not a number' });
  }
};
