import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Login from './auth/Login.jsx';
import Register from './auth/Register.jsx';
import Home from "./booking/Home.jsx";


const TopNav = () =>
{
  <div className='nav bg-light d-flex justify-content-between'>
    <Link className='nav-link' to="/"> Home</Link>
    <Link className='nav-link' to="/login"> Login</Link>
    <Link className='nav-link' to="/register"> Register</Link>
  </div>;
};


function App ()
{
  return (
    <BrowserRouter>
      <TopNav />
      <Switch>
        <Route exact path="/" component={ Home } />
        <Route exact path="/login" component={ Login } />
        <Route exact path="/register" component={ Register } />
      </Switch>
    </BrowserRouter>
  );
}
export default App;