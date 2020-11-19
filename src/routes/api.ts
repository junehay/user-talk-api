import express, { Router } from 'express';
import CryptoJS from 'crypto-js';
import sha256 from 'crypto-js/sha256';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import moment from 'moment';
import { UserList } from '../models/userList';
import { BuddyList } from '../models/buddyList';
import { DirectMessage } from '../models/directMessage';
import { BroadcastMessage } from '../models/broadcastMessage';
import { ValidationError, BodyError, ParamsError, HeadersError } from '../utils/error';
import { UserLoginHstr } from '../models/userLoginHstr';

const router: Router = express.Router();

router.post('/user', async (req, res, next) => {
  interface Body {
    userId: string;
    userPw: string;
    userNm: string;
  }

  const body = req.body as Body;
  const userId = body.userId;
  const userPw = body.userPw;
  const userNm = body.userNm;
  try {
    if (!userId || !userPw || !userNm) {
      throw new BodyError('ERR_BODY');
    } else {
      const chk = await UserList.findOne({
        where: {
          user_id: userId
        },
        raw: true
      });

      if (chk) {
        throw new ValidationError('ERR_ALREADY_USE');
      } else {
        await UserList.create({
          user_id: userId,
          user_pw: userPw,
          user_nm: userNm,
          user_stts: '1'
        });
        res.send('OK');
      }
    }
  } catch (err) {
    if (err instanceof BodyError || err instanceof ValidationError) {
      res.status(400).json(err.message);
    } else {
      next(err);
    }
  }
});

router.post('/auth', async (req, res, next) => {
  interface Body {
    userId: string;
    userPw: string;
  }
  interface ReturnJson {
    lastlogin?: string;
    buddies?: UserList[];
    messages?: Messages[];
  }
  interface Messages {
    type?: string;
    message?: string;
    createdAt?: Date;
  }

  const body = req.body as Body;
  const userId = body.userId;
  const userPw = body.userPw;
  try {
    if (!userId || !userPw) {
      throw new BodyError('ERR_BODY');
    } else {
      const userCrypPw = sha256(userPw).toString(CryptoJS.enc.Hex);

      const userData = await UserList.findOne({
        include: [
          { model: UserLoginHstr, order: [['createdAt', 'DESC']], limit: 1 },
          BuddyList,
          { model: BroadcastMessage, order: [['createdAt', 'DESC']], limit: 10 },
          { model: DirectMessage, order: [['createdAt', 'DESC']], limit: 10 }
        ],
        where: {
          user_id: userId
        }
      });

      if (!userData) {
        throw new ValidationError('ERR_INVALID_USERID');
      } else {
        if (userData.user_pw !== userCrypPw) {
          throw new ValidationError('ERR_INVALID_PWD');
        } else if (userData.user_stts === '9') {
          throw new ValidationError('ERR_DELETED_ID');
        } else {
          const returnJson: ReturnJson = {};
          if (userData.userLoginHstrs) {
            returnJson.lastlogin = moment(userData.userLoginHstrs[0].createdAt).format('YYYYMMDDHHmmss');
          } else {
            returnJson.lastlogin = 'new';
          }
          const buddies = [];
          if (userData.buddyLists) {
            for (const v of userData.buddyLists) {
              console.log('vvvvvvvvv', v.bd_intt_id);
              const buddy = await UserList.findOne({
                attributes: ['user_nm', 'user_id', 'intt_id', 'user_stts'],
                where: {
                  intt_id: v.bd_intt_id,
                  user_stts: ['1', '5']
                },
                raw: true
              });
              if (buddy) {
                buddies.push(buddy);
              }
            }
          }
          returnJson.buddies = buddies;

          const messages: Messages[] = [];
          userData.directMessages?.forEach((v) => {
            const data: Messages = {};
            data.type = 'DM';
            data.message = v.message;
            data.createdAt = v.createdAt;
            messages.push(data);
          });
          userData.broadcastMessages?.forEach((v) => {
            const data: Messages = {};
            data.type = 'BM';
            data.message = v.message;
            data.createdAt = v.createdAt;
            messages.push(data);
          });
          messages.sort((a, b) => (a.createdAt && b.createdAt ? b.createdAt.getTime() - a.createdAt?.getTime() : 1));

          returnJson.messages = messages.filter((v) => delete v.createdAt).slice(0, 10);

          await UserLoginHstr.create({
            intt_id: userData.intt_id
          });
          const token = jwt.sign({ id: userData.intt_id }, process.env.SECRET_KEY as string, { expiresIn: '1h' });
          res.cookie('token', token, { maxAge: 360000, httpOnly: true, signed: true }).json(returnJson);
        }
      }
    }
  } catch (err) {
    if (err instanceof BodyError || err instanceof ValidationError) {
      res.status(400).send(err.message);
    } else {
      next(err);
    }
  }
});

router.use((req, res, next) => {
  interface SignedCookies {
    token?: string;
  }
  interface Decoded {
    id?: string;
  }
  try {
    const signedCookies = req.signedCookies as SignedCookies;
    const token = signedCookies.token as string;
    const decoded = jwt.verify(token, process.env.SECRET_KEY as string);
    const id = (decoded as Decoded).id;
    res.locals.id = id;
    next();
  } catch (err) {
    if (err instanceof JsonWebTokenError) {
      res.status(401).json(err.message);
    } else {
      next(err);
    }
  }
});

router.post('/buddy', async (req, res, next) => {
  interface Body {
    buddyUserId: string;
  }
  const id = res.locals.id as string;
  const body = req.body as Body;
  const buddyUserId = body.buddyUserId;
  try {
    if (!buddyUserId) {
      throw new BodyError('ERR_BODY');
    } else {
      const userData = await UserList.findOne({
        attributes: ['intt_id'],
        where: {
          user_id: buddyUserId
        },
        raw: true
      });
      if (!userData) {
        throw new ValidationError('ERR_INVALID_BUDDY_USERID');
      } else if (id === userData.intt_id) {
        throw new ValidationError('ERR_INVALID_USERID');
      } else {
        const buddyId = userData.intt_id;

        await BuddyList.create({
          intt_id: id,
          bd_intt_id: buddyId
        });

        res.send('OK');
      }
    }
  } catch (err) {
    if (err instanceof BodyError || err instanceof ValidationError) {
      res.status(400).json(err.message);
    } else {
      next(err);
    }
  }
});

router.delete('/buddy/:id', async (req, res, next) => {
  const buddyId = req.params.id;
  try {
    if (!req.headers['x-jptk-request'] || req.headers['x-jptk-request'].length < 8) {
      throw new HeadersError('ERR_HEADERS');
    } else {
      const result = await BuddyList.destroy({
        where: {
          bd_intt_id: buddyId
        }
      });
      if (result === 0) {
        throw new ParamsError('ERR_PARAMS');
      } else {
        res.send('OK');
      }
    }
  } catch (err) {
    if (err instanceof ParamsError || err instanceof HeadersError) {
      res.status(400).json(err.message);
    } else {
      next(err);
    }
  }
});

router.post('/message', async (req, res, next) => {
  interface Body {
    message: string;
    buddyId: string;
    option: string;
  }
  const id = res.locals.id as string;
  const body = req.body as Body;
  const message = body.message;
  const buddyId = body.buddyId;
  const option = body.option;

  try {
    if (!message || !option) {
      throw new BodyError('ERR_BODY');
    } else {
      switch (option) {
        case 'direct': {
          const BuddyData = await BuddyList.findAll({
            where: {
              intt_id: id
            },
            raw: true
          });
          const chkBuddy = BuddyData.some((v) => v.bd_intt_id === buddyId);
          if (!chkBuddy) {
            throw new BodyError('ERR_NO_BUDDY');
          } else {
            await DirectMessage.create({
              intt_id: id,
              bd_intt_id: buddyId,
              message: message
            });

            res.send('OK');
          }
          break;
        }
        case 'broadcast': {
          await BroadcastMessage.create({
            intt_id: id,
            message: message
          });

          res.send('OK');
          break;
        }
        default:
          throw new BodyError('ERR_OPTION');
      }
    }
  } catch (err) {
    if (err instanceof BodyError) {
      res.status(400).json(err.message);
    } else {
      next(err);
    }
  }
});

router.delete('/user', async (req, res, next) => {
  const id = res.locals.id as string;
  try {
    if (!req.headers['x-jptk-request'] || req.headers['x-jptk-request'].length < 8) {
      throw new HeadersError('ERR_HEADERS');
    } else {
      await UserList.update(
        {
          user_stts: '9'
        },
        {
          where: {
            intt_id: id
          }
        }
      );

      res.send('OK');
    }
  } catch (err) {
    if (err instanceof HeadersError) {
      res.status(400).json(err.message);
    } else {
      next(err);
    }
  }
});

export default router;
