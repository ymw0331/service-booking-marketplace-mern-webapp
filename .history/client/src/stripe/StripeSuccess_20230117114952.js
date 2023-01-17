import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Jumbotron from '../components/cards/Jumbotron';


const StripeCancel = () =>
{
  const { auth: { token } } = useSelector( ( state ) => ( { ...state } ) );
  // const { token } = auth;

  useEffect( () =>
  {

  } );

  const { hotelId } = useParams();

  return (
    <>
      <Jumbotron
        title={ `Payment Success: ${ hotelId }` }
      />
    </>
  );
};

export default StripeCancel;
