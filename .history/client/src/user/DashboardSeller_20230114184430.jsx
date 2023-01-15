import DashboardNav from '../components/DashboardNav';
import ConnectNav from '../components/ConnectNav';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HomeOutline } from '@ant-design/icons';

const DashboardSeller = () =>
{

  const { auth } = useSelector( ( state ) => ( { ...state } ) );
  const connected = () =>
  (
    <div className='container-fluid'>
      <div className='row'>

        <div className='col-md-10'>
          <h2>Your Hotels</h2>
        </div>

        <div className='col-md-2'>
          <Link
            to="/hotels/new"
            className='btn btn-primary '>
            + Add New
          </Link>
        </div>

      </div>
    </div>
  );

  const notConnected = () =>
  (
    <div className='container-fluid'>
      <div className='row '>
        <div className='col-md-6 offset-md-3 text-center'>
          <HomeOutline className="h1" />
          <h4>Setup payout to post hotel rooms</h4>
          <p className="">


          </p>
        </div>

      </div>
    </div>
  );


  return (
    <>
      <div className='container-fluid bg-secondary p-5'>
        <ConnectNav />
      </div>
      <div className='container-fluid p-4'>
        <DashboardNav />
      </div>

      { auth &&
        auth.user &&
        auth.user.stripe_seller &&
        auth.user.stripe_seller.charges_enabled
        ? connected() : notConnected()
      }

      {/* <pre>{ JSON.stringify( auth, null, 4 ) }</pre> */ }

    </>
  );
};

export default DashboardSeller;