import './App.css'
import React, { Fragment, useEffect } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Landing from './components/layout/Landing'
import Register from './components/layout/auth/Register'
import Login from './components/layout/auth/Login'
import { loadUser } from './actions/auth'
import setAuthToken from './utils/setAuthToken'
import Dashboard from './components/layout/dashboard/Dashboard'
import PrivateRoute from './components/layout/routing/PrivateRoute'
import EditProfile from './components/profile-form/EditProfile'
import CreateProfile from './components/profile-form/CreateProfile'

// Redux
import { Provider } from 'react-redux'
import store from './store'
import Alert from './components/layout/Alert'

if (localStorage.token) {
  setAuthToken(localStorage.token)
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser())
  }, [])
  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <Navbar />
          <Route exact path='/' component={Landing} />
          <section className='container'>
            <Alert />
            <Switch>
              <Route exact path='/login' component={Login} />
              <Route exact path='/register' component={Register} />
              <PrivateRoute exact path='/dashboard' component={Dashboard} />
              <PrivateRoute
                exact
                path='/create-profile'
                component={CreateProfile}
              />
              <PrivateRoute
                exact
                path='/edit-profile'
                component={EditProfile}
              />
            </Switch>
          </section>
        </Fragment>
      </Router>
    </Provider>
  )
}

export default App
