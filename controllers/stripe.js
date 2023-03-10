import User from "../models/user";
import queryString from "query-string";
import Hotel from '../models/hotel';
import Order from '../models/order';

// const stripe = require( 'stripe' )( process.env.STRIPE_SECRET );

// const stripe = require( 'stripe' )( process.env.STRIPE_TEST_SECRET );
const stripe = require( 'stripe' )( process.env.STRIPE_SECRET_SG );


export const createConnectAccount = async ( req, res ) =>
{
  try
  {
    //1. find user from db
    const user = await User.findById( req.auth._id ).exec();
    console.log( "USER ===>", user );

    //2. if user don't have stripe_account_id yet, create new
    if ( !user.stripe_account_id )
    {
      console.log( "CREATING STRIPE ID FOR ACCOUNT" );
      const account = await stripe.accounts.create( { type: "express" } );
      console.log( 'ACCOUNT => ', account );
      user.stripe_account_id = account.id;
      user.save();
      console.log( "CREATED AND SAVED STRIPE ID" );
    }
    //3. create account link based on account id (for frontedn to complete onboarding)
    let accountLink = await stripe.accountLinks.create( {
      account: user.stripe_account_id,
      refresh_url: process.env.STRIPE_REDIRECT_URL,
      return_url: process.env.STRIPE_REDIRECT_URL,
      type: "account_onboarding",
    } );

    // 4. pre-fill any info such as email (optional), then send url resposne to frontend
    accountLink = Object.assign( accountLink, {
      "stripe_user[email]": user.email || undefined,
    } );
    // 5. then send the account link as response to frontend
    // res.send( `${ accountLink.url }?${ queryString.stringify( accountLink ) }` );
    let link = ( `${ accountLink.url }?${ queryString.stringify( accountLink ) }` );
    console.log( 'LOGIN LINK ==>', link );
    res.send( link );
    // console.log( `RESPOND SEND TO FRONTEND TO ${ accountLink.url } ` );


  } catch ( error )
  {
    console.log( " Error createConnectAccount ==>", error );
  }

};

// cannot change the delaydays by callin api call, abort this (just an example)
const updateDelayDays = async ( accountId ) =>
{
  const account = await stripe.account.update( accountId, {
    settings: {
      payouts: {
        schedule: {
          delay_days: 7
        }
      }
    }
  } );
};


export const getAccountStatus = async ( req, res ) =>
{
  // console.log( 'GET ACCOUNT STATUS' );
  const user = await User.findById( req.auth._id ).exec();
  const account = await stripe.accounts.retrieve( user.stripe_account_id );
  // console.log( "USER ACCOUNT RETRIEVED", account );

  //update delay days
  // const updatedAccount = await updateDelayDays(account.id)
  const updatedUser = await
    User.findByIdAndUpdate( user._id,
      { stripe_seller: account },
      { new: true }
    )
      .select( '-password' )
      .exec();

  // console.log( "updatedUser ==>", updatedUser );
  res.json( updatedUser );

};


export const getAccountBalance = async ( req, res ) =>
{
  const user = await User.findById( req.auth._id ).exec();

  try
  {
    const balance = await stripe.balance.retrieve( {
      stripeAccount: user.stripe_account_id
    } );
    // console.log( "BALANCE ==> ", balance );
    res.json( balance );

  } catch ( error )
  {
    console.log( error );
  }

};



export const payoutSetting = async ( req, res ) =>
{
  try
  {
    const user = await User.findById( req.auth._id ).exec();
    const loginLink = await stripe.accounts.createLoginLink( user.stripe_seller.id, {
      redirect_url: process.env.STRIPE_SETTINGS_REDIRECT_URL
    } );


    console.log( "LOGIN LINK FOR PAYOUT SETTINGS ==>", loginLink );
    res.json( loginLink );

  } catch ( error )
  {
    console.log( "STRIPE PAYOUT SETTING ERR ==>", error );

  }
};



export const stripeSessionId = async ( req, res ) =>
{
  // console.log( "your hit the stripe session id", req.body.hotelId );
  //1. get hotel id from req.body
  const { hotelId } = req.body;
  //2. find the hotel based on hotel id from db
  const item = await Hotel.findById( hotelId ).populate( "postedBy" ).exec();
  console.log( "item price ==>", item.price );

  //3. 20% charge as application fee
  const fee = ( item.price * 20 ) / 100;
  console.log( "fee price ==>", parseFloat( fee ) );
  //4. create a session
  const session = await stripe.checkout.sessions.create( {

    //5. purchasing item details, it will be shown to user on checkout
    payment_method_types: [ 'card' ],
    line_items: [
      {
        price_data: {
          currency: 'sgd',
          product_data: {
            name: item.title
          },
          unit_amount: item.price * 100,//in cents
        },
        quantity: 1
      }
    ],
    mode: 'payment',

    //6. create payment intent with app fee and destination charge 80%
    payment_intent_data: {
      application_fee_amount: parseInt( fee ) * 100,
      //this seller can see his balance in our frontend dashboard
      transfer_data: {
        destination: item.postedBy.stripe_account_id
      }
    },

    //success and cancel urls
    success_url: `${ process.env.STRIPE_SUCCESS_URL }/${ item._id }`,
    cancel_url: process.env.STRIPE_CANCEL_URL
  } );
  //7. add this session object to user in the db
  await User.findByIdAndUpdate( req.auth._id, { stripeSession: session } ).exec();

  //8. send sessionId as response to frontend
  res.send( {
    sessionId: session.id
  } );
  console.log( "SESSION =====> ", session );
};


export const stripeSuccess = async ( req, res ) =>
{
  try
  {
    // 1 get hotel id from req.body
    const { hotelId } = req.body;
    // 2 find currently logged in user
    const user = await User.findById( req.auth._id ).exec();
    // check if user has stripeSession
    if ( !user.stripeSession ) return;
    // 3 retrieve stripe session, based on session id we previously save in user db
    const session = await stripe.checkout.sessions.retrieve(
      user.stripeSession.id
    );
    // 4 if session payment status is paid, create order
    if ( session.payment_status === "paid" )
    {
      // 5 check if order with that session id already exist by querying orders collection
      const orderExist = await Order.findOne( {
        "session.id": session.id,
      } ).exec();
      if ( orderExist )
      {
        // 6 if order exist, send success true
        res.json( { success: true } );
      } else
      {
        // 7 else create new order and send success true
        let newOrder = await new Order( {
          hotel: hotelId,
          session,
          orderedBy: user._id,
        } ).save();
        // 8 remove user's stripeSession
        await User.findByIdAndUpdate( user._id, {
          $set: { stripeSession: {} },
        } );
        res.json( { success: true } );
      }
    }
  } catch ( err )
  {
    console.log( "STRIPE SUCCESS ERR", err );
  }
};

