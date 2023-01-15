import Jumbotron from '../components/cards/Jumbotron';
import { useState } from "react";
import { toast } from "react-toastify";
import { DatePicker, Select } from 'antd';
import moment from 'moment';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import { createHotel } from '../actions/hotel';
import { useSelector } from 'react-redux';
import HotelCreateForm from '../components/forms/HotelCreateForm';

const config = {
  appId: process.env.REACT_APP_ALGOLIA_APP_ID,
  apiKey: process.env.REACT_APP_ALGOLIA_API_KEY,
  language: "en",
  countries: [ "my" ],
};

const NewHotel = () =>
{
  const { Option } = Select;

  //redux
  const { auth } = useSelector( ( state ) => ( { ...state } ) );
  const { token } = auth;
  // state
  const [ values, setValues ] = useState( {
    title: "",
    content: "",
    image: "",
    price: "",
    from: "",
    to: "",
    bed: "",
  } );

  const [ preview, setPreview ] = useState(
    "https://via.placeholder.com/100x100.png?text=PREVIEW"
  );

  const [ location, setLocation ] = useState( "" );
  const [ coordinates, setCoordinates ] = useState(
    { lat: null, lng: null }
  );


  // destructuring variables from state
  const { title, content, image, price, from, to, bed } = values;

  const handleSubmit = async ( e ) =>
  {
    e.preventDefault();
    // console.log( values );
    // console.log( location );
    let hotelData = new FormData();
    hotelData.append( 'title', title );
    hotelData.append( 'content', content );
    hotelData.append( 'location', location );
    hotelData.append( 'price', price );
    image && hotelData.append( 'image', image );
    hotelData.append( 'from', from );
    hotelData.append( 'to', to );
    hotelData.append( 'bed', bed );

    console.log( [ ...hotelData ] );

    //use form data for file data (image)
    let res = await createHotel( token, hotelData );
    console.log( "HOTEL CREATE RES =>", res );
    toast( "New hotel is posted" );
    setTimeout( () =>
    {
      //reload to clear fields
      window.location.reload();
    }, 1000 );

  };

  const handleImageChange = ( e ) =>
  {
    // console.log(e.target.files[0]);
    setPreview( URL.createObjectURL( e.target.files[ 0 ] ) );
    setValues( { ...values, image: e.target.files[ 0 ] } );
  };

  const handleChange = ( e ) =>
  {
    setValues( { ...values, [ e.target.name ]: e.target.value } );
  };

  const handleLocationSelect = async ( value ) =>
  {
    const results = await geocodeByAddress( value );
    const latLng = await getLatLng( results[ 0 ] );

    setLocation( value );
    setCoordinates( latLng );
    // console.log( results );
  };


  return (
    <>

      <Jumbotron
        title="Add new hotel"
      />

      <div className="container-fluid">
        <div className="row">
          <div className="col-md-10">
            <br />
            {/* { hotelForm() } */}
          
          
          </div>
          <div className="col-md-2">
            <img
              src={ preview }
              alt="preview_image"
              className="img img-fluid m-2"
            />
            <pre>{ JSON.stringify( values, null, 4 ) }</pre>
            { JSON.stringify( location ) }
          </div>
        </div>
      </div>


    </>
  );
};

export default NewHotel;