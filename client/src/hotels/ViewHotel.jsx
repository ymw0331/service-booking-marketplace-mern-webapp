import Jumbotron from '../components/cards/Jumbotron';
import React, { useState, useEffect } from "react";
import { useStore } from "react-redux";
import { read, diffDays, isAlreadyBooked } from "../actions/hotel";
import moment from "moment";
import { useSelector } from "react-redux";
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getSessionId } from '../actions/stripe';
import { loadStripe } from '@stripe/stripe-js';


const ViewHotel = () =>
{
  const [ hotel, setHotel ] = useState( {} );
  const [ image, setImage ] = useState( "" );
  const [ loading, setLoading ] = useState( false );
  const [ alreadyBooked, setAlreadyBooked ] = useState( false );

  const { auth } = useSelector( ( state ) => ( { ...state } ) );

  const { hotelId } = useParams();
  const navigate = useNavigate();

  useEffect( () =>
  {
    if ( auth && auth.token )
    {
      isAlreadyBooked( auth.token, hotelId ).then( ( res ) =>
      {
        // console.log( res );
        if ( res.data.ok ) setAlreadyBooked( true );
      } );
    }
  }, [] );


  useEffect( () =>
  {
    loadSellerHotel();
  }, [] );

  const loadSellerHotel = async () =>
  {
    let res = await read( hotelId );
    // console.log( res );
    setHotel( res.data );
    setImage( `${ process.env.REACT_APP_API }/hotel/image/${ res.data._id }` );
  };

  const handleClick = async ( e ) =>
  {
    if ( !auth || !auth.token )
    {
      navigate( "/login" );
      return;
    }
    setLoading( true );
    e.preventDefault();
    if ( !auth ) navigate( "/login" );
    // console.log( "token ==>", auth.token );
    // console.log( "hotelId ==>", hotelId );


    let res = await getSessionId( auth.token, hotelId );
    // console.log( "get sessionId reaponse ==>", res.data.sessionId );
    const stripe = await loadStripe( process.env.REACT_APP_STRIPE_KEY_SG );
    stripe
      .redirectToCheckout( {
        sessionId: res.data.sessionId
      } )
      .then( ( result ) => console.log( result ) );
  };

  return (
    <>
      <Jumbotron
        title={ `${ hotel.title }` }

      />
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-6">
            <br />
            <img src={ image } alt={ hotel.title } className="img img-fluid m-2" />
          </div>

          <div className="col-md-6">
            <br />
            <b>{ hotel.content }</b>
            <p className="alert alert-info mt-3">${ hotel.price }</p>
            <p className="card-text">
              <span className="float-right text-primary">
                for { diffDays( hotel.from, hotel.to ) }{ " " }
                { diffDays( hotel.from, hotel.to ) <= 1 ? " day" : " days" }
              </span>
            </p>
            <p>
              From <br />{ " " }
              { moment( new Date( hotel.from ) ).format( "MMMM Do YYYY, h:mm:ss a" ) }
            </p>
            <p>
              To <br />{ " " }
              { moment( new Date( hotel.to ) ).format( "MMMM Do YYYY, h:mm:ss a" ) }
            </p>
            <i>Posted by { hotel.postedBy && hotel.postedBy.name }</i>
            <br />
            <button
              onClick={ handleClick }
              className="btn btn-block btn-lg btn-primary mt-3"
              disabled={ loading || alreadyBooked }
            >
              { loading
                ? "Loading..."
                : alreadyBooked
                  ? "Already Booked"
                  : auth && auth.token
                    ? "Book Now"
                    : "Login to Book" }
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewHotel;
