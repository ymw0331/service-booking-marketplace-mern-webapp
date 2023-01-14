import { useSelector } from 'react-redux';


const Home = () =>
{
  const state = useSelector( ( state ) => state );

  return (
    (
      <div className='container-fluid h-1 p-5 text-center'>
        <h1>
          Home Page

        </h1>
      </div>
    )
  );
};


export default Home;