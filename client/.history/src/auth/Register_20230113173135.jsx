import { useState } from "react";
import Jumbotron from '../components/cards/Jumbotron';
import axios from 'axios';
import { toast } from 'react-hot-toast';


export default function Register ()
{
  //state
  const [ name, setName ] = useState( '' );
  const [ email, setEmail ] = useState( '' );
  const [ password, setPassword ] = useState( '' );

  // console.log( process.env.REACT_APP_API );

  const handleSubmit = async ( e ) =>
  {
    e.preventDefault();
    try
    {
      const { data } = await axios.post( `/register`,
        {
          name,
          email,
          password
        } );
      console.log( data );

      if ( data?.error )
      {
        toast.error( data.error );
      } else
      {
        localStorage.setItem( 'auth', JSON.stringify( data ) );
        toast.success( "Registration successful" );
      }

    } catch ( error )
    {
      console.log( error );
      toast.error( "Registration failed. Please try again" );
    }
  };


  const registerForm = () =>
  (
    <form onSubmit={ handleSubmit } >
      <input
        type="text"
        className="form-control mb-4 p-2"
        placeholder="Enter your name"
        value={ name }
        onChange={ ( e ) => setName( e.target.value ) }
        autoFocus
      >
      </input>
      <input
        type="email"
        className="form-control mb-4 p-2"
        placeholder="Enter your email"
        value={ email }
        onChange={ ( e ) => setEmail( e.target.value ) }
      >
      </input>

      <input
        type="password"
        className="form-control mb-4 p-2"
        placeholder="Enter your password"
        value={ password }
        onChange={ ( e ) => setPassword( e.target.value ) }
      >
      </input>
      <button className="btn btn-primary " type="submit" onClick={ handleSubmit }>
        Submit
      </button>
    </form>
  );

  return (
    <div>
      <Jumbotron title="Register" />
      <div className="container mt-5 ">
        <div className="row">
          <div className="col-md-6 offset-md-3">
            { registerForm() }
          </div>
        </div>
      </div>

      <pre>{ JSON.stringify( name, null, 4 ) }</pre>
      <pre>{ JSON.stringify( email, null, 4 ) }</pre>
      <pre>{ JSON.stringify( password, null, 4 ) }</pre> </div>
  );
}

