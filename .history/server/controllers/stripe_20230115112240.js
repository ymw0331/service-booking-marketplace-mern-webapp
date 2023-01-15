import User from "../models/user";
import queryString from "query-string";
// const stripe = require( 'stripe' )( process.env.STRIPE_SECRET );

const stripe = require( 'stripe' )( 'sk_test_4eC39HqLyjWDarjtT1zdp7dc' );


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