import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bulma/css/bulma.css'
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import axios from 'axios';
import UserContext from './contexts/UserContext';

function App() {

  const [accessToken, setAccessToken] = useState();
  const [refreshToken, setRefreshToken] = useState();
  const [expiresIn, setExpiresIn] = useState();
  const [userID, setUserID] = useState();
  const [userName, setUserName] = useState();

  let URI_ENDPOINT;
  if (window.location.origin.includes("localhost")) {
    URI_ENDPOINT = "http://localhost:5000";
  } else {
    URI_ENDPOINT = window.location.origin + ":5000";
  }

  const navigate = useNavigate();

  const CLIENT_ID = "dcc2f421b72e4c31b5d04baf14b5c38c"
  const REDIRECT_URI = window.location.origin;
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "code"
  const SCOPES = "user-top-read playlist-modify-private user-read-email user-follow-modify playlist-modify-public";

  console.log("User ID", userID);
  console.log("Username", userName);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    const joinGroupID = new URLSearchParams(window.location.search).get("joinGroup");

    if (joinGroupID) {
      const accessToken = window.localStorage.getItem("spotifyToken");
      const refreshToken = window.localStorage.getItem("spotifyRefreshToken");
      console.log("access token", accessToken, "refresh token", refreshToken);
      //Redirect to spotify login
      window.sessionStorage.setItem("joinGroupID", joinGroupID);
      window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`;
    } else if (code) {
      const joinGroupID = window.sessionStorage.getItem("joinGroupID");
      if (joinGroupID) {
        window.sessionStorage.removeItem("joinGroupID");
        axios.post(URI_ENDPOINT + '/login', { code })
          .then(res => {
            setAccessToken(res.data.accessToken);
            setRefreshToken(res.data.refreshToken);
            setExpiresIn(res.data.expiresIn);
            setUserID(res.data.userID);
            setUserName(res.data.userName);
            window.localStorage.setItem("spotifyToken", res.data.accessToken);
            window.localStorage.setItem("spotifyRefreshToken", res.data.refreshToken);
            window.history.pushState({}, null, '/');
            axios.post(URI_ENDPOINT + "/joinGroup", { groupID: joinGroupID, accessToken: res.data.accessToken, userID: res.data.userID })
              .then(res => {
                console.log("Successfully joined group", res);
              });
          });
      } else {
        axios.post(URI_ENDPOINT + '/login', { code })
          .then(res => {
            console.log("Auth response", res);
            setAccessToken(res.data.accessToken);
            setRefreshToken(res.data.refreshToken);
            setExpiresIn(res.data.expiresIn);
            setUserID(res.data.userID);
            setUserName(res.data.userName);
            window.localStorage.setItem("spotifyToken", res.data.accessToken);
            window.localStorage.setItem("spotifyRefreshToken", res.data.refreshToken);
            window.history.pushState({}, null, '/');
          })
          .catch(err => {
            console.log("Use auth failed.", err);
            window.localStorage.removeItem("spotifyToken");
            navigate('/?timeout=true');
          });
      }
    } else {
      const refreshToken = window.localStorage.getItem("spotifyRefreshToken");
      if (refreshToken) {
        axios.post(URI_ENDPOINT + '/refresh', { refreshToken })
          .then(res => {
            setAccessToken(res.data.accessToken);
            setExpiresIn(res.data.expiresIn);
            setUserID(res.data.id);
            setUserName(res.data.userName);
            window.localStorage.setItem("spotifyToken", res.data.accessToken);
          })
          .catch(err => {
            console.log("Error refreshing token", err);
            setAccessToken(null);
            setRefreshToken(null);
            setExpiresIn(null);
            window.localStorage.removeItem("spotifyToken");
            window.localStorage.removeItem("spotifyRefreshToken");
          });
      } else {
        window.localStorage.removeItem("spotifyToken");
      }
    }
  }, []);

  useEffect(() => {
    if (!refreshToken || !expiresIn) return;
    const interval = setInterval(() => {
      if (!refreshToken) return;
      console.log("Refreshing token");
      axios.post(URI_ENDPOINT + '/refresh', { refreshToken })
        .then(res => {
          setAccessToken(res.data.accessToken);
          setExpiresIn(res.data.expiresIn);
        })
        .catch(err => {
          console.log("Error refreshing token", err);
          setAccessToken(null);
          setRefreshToken(null);
          setExpiresIn(null);
          navigate('/?timeout=true');
        });
      return () => clearInterval(interval);
    }, (expiresIn - 60) * 1000);
  }, [refreshToken, expiresIn]);

  const logout = () => {
    window.localStorage.removeItem("spotifyToken");
    window.localStorage.removeItem("spotifyRefreshToken");
    setAccessToken(null);
    setRefreshToken(null);
    setExpiresIn(null);
  }

  return (
    <div>
      <UserContext.Provider value={{ userID, accessToken, URI_ENDPOINT }} >
        {accessToken ? <Dashboard accessToken={accessToken} logout={logout} /> : <Login />}
      </UserContext.Provider>
    </div>
  );
}

export default App;
