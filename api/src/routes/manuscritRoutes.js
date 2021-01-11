import express from 'express';
import uuid from 'uuid';

import service from '../services/manuscritService';
import auth from '../services/authService';

import logger from '../utils/logger';

const router = express.Router();

router.get('/:num', async(req, res, next) => {
  const id = uuid.v4();
  logger.info(`${id}: GET manuscrit by num for num ${req.params.num}`);
  try {
    const manus = await service.findByNum(req.params.num);
    logger.info(`${id}: GET manuscrit done`);
    res.send(manus);
  } catch (err) {
    logger.error(`${id}: Failed to find manuscrit - ${err}`);
    next(err);
  }
});


router.post('/', auth.isAuthenticated, async (req, res, next) => {
  const id = uuid.v4();
  logger.info(`${id}: POST manuscrit`);
  logger.info(`${id}: POST manuscrit user ${req.user.name}`);

  const manus = req.body;
  try{
    const result = await service.create(manus);
    return res.send({'message':'OK'});
  }catch(err){
    console.log(`${id}: POST manuscrit ERROR ${err}`);
    return res.status(500).json({
        message: "Error",
        error: err,
    });
  }
});

router.post('/list', auth.isAuthenticated, async (req, res, next) => {
  const id = uuid.v4();
  logger.info(`${id}: POST manuscritList`);
  logger.info(`${id}: POST manuscritList user ${req.user.name}`);

  const manus = req.body;
  try{
    const result = await service.importList(manus);
    return res.send({'message':'OK'});
  }catch(err){
    console.log(`${id}: POST manuscrit ERROR ${err}`);
    return res.status(500).json({
        message: "Error",
        error: err,
    });
  }
});

export default router;
