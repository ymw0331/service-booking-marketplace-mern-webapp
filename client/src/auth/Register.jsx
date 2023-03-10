import { useState } from "react";
import RegisterForm from "../components/RegisterForm";
import Jumbotron from "../components/cards/Jumbotron";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { register } from '../actions/auth';

const Register = () =>
{
  const [ name, setName ] = useState( "" );
  const [ email, setEmail ] = useState( "" );
  const [ password, setPassword ] = useState( "" );


  const navigate = useNavigate();

  const handleSubmit = async ( e ) =>
  {
    e.preventDefault();
    try
    {
      const res = await register( {
        name,
        email,
        password,
      } );
      toast.success( "Register success. Please login" );
      console.log( "REGISTER USER ===> ", res );
      navigate( "/login" );

    } catch ( err )
    {
      console.log( err );
      if ( err.response.status === 400 )
        toast.error( err.response.data );
    }
  };

  // console.log( process.env.REACT_APP_API );

  return (
    <>
      <Jumbotron title={ "Registration" } />

      <div className="container">
        <div className="row">
          <div className="col-md-6 offset-md-3">
            <RegisterForm
              handleSubmit={ handleSubmit }
              name={ name }
              setName={ setName }
              email={ email }
              setEmail={ setEmail }
              password={ password }
              setPassword={ setPassword }
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
