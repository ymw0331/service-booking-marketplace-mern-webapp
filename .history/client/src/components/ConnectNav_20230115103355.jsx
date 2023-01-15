import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, Avatar } from 'antd';
import moment from 'moment';
import { getAccountBalance } from '../actions/stripe';

const { Meta } = Card;

const ConnectNav = () =>
{
  const { auth } = useSelector( ( state ) => ( { ...state } ) );
  const { user } = auth;

  useEffect( () =>
  {
    getAccountBalance();
  } );



  
  return (
    <div className='d-flex justify-content-around'>
      <Card>
        <Meta
          avatar={
            <Avatar>
              user.name[ 0 ]
            </Avatar> }
          title={ user.name }
          description={ `Joined ${ moment( user.createdAt ).fromNow() }` }
        />
      </Card>


      { auth && auth.user
        && auth.user.stripe_seller
        && auth.user.stripe_seller.charges_enabled &&
        (
          <>
            <div>Pending balance</div>
            <div>Payout settings</div>
          </>
        )
      }
    </div>
  );
};


export default ConnectNav;
