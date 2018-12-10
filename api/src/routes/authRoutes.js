// @flow

import express from 'express';
import uuid from 'uuid';
import jwt from 'jsonwebtoken';
import auth from '../../src/services/authService';
import logger from '../utils/logger';
import config from '../../config';


const router = express.Router();

router.post("/login", async (req, res, next)  => {
  const id = uuid.v4();
  logger.info(`${id}: POST /login`);

  let { email, password } = req.body;
  try{
    let user = await auth.authenticate(email, password);
    let opts = {};
    opts.expiresIn = 120;  //token expires in 2min
    const secret = config.auth.secrets.session; //FIXME normally stored in process.env.secret
    const token = jwt.sign({ email }, secret, opts);
    return res.status(200).json({
        message: "Auth Passed",
        token,
    })
  }catch(err){
    return res.status(401).json({ message: "Auth Failed" });
  }
});

export default router;
