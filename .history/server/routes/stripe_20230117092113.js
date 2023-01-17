import express from "express";

const router = express.Router();

import { requireSignin } from "../middlewares/index";

//controllers
import { createConnectAccount, getAccountStatus, getAccountBalance, payoutSetting } from '../controllers/stripe';

router.post( '/create-connect-account', requireSignin, createConnectAccount );
router.post( '/get-account-status', requireSignin, getAccountStatus );
router.post( '/get-account-balance', requireSignin, getAccountBalance );
router.post( '/payout-setting', requireSignin, payoutSetting );
router.post( '/payout-setting', requireSignin, payoutSetting );


// export default router;
module.exports = router;