import React from 'react'

function Login() {

    const CLIENT_ID = "dcc2f421b72e4c31b5d04baf14b5c38c"
    const REDIRECT_URI = window.location.origin;
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
    const RESPONSE_TYPE = "code"
    const SCOPES = "user-top-read playlist-modify-private user-read-email user-follow-modify playlist-modify-public";

    return (
        <div>
            <div className='is-flex is-size-1 is-justify-content-center'>
                <p>
                    Group Spotify
                </p>
            </div>
            <hr></hr>
            <div className='is-flex is-justify-content-center'>
                <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`} className='button is-primary is-size-2'>Log in with Spotify</a>
            </div>
        </div>
    )
}

export default Login