import React from 'react';
import Navbar from './Navbar';

function Login() {
	const CLIENT_ID = 'dcc2f421b72e4c31b5d04baf14b5c38c';
	const REDIRECT_URI = window.location.origin;
	const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
	const RESPONSE_TYPE = 'code';
	const SCOPES =
		'user-top-read playlist-modify-private user-read-email user-follow-modify playlist-modify-public';

	const isTimeout = new URLSearchParams(window.location.search).get('timeout');

	return (
		<div>
			<Navbar />
			<div className='container'>
				<div className='card p-5 my-3 has-text-centered'>
					<p className='mb-3 is-size-2'>Welcome to Group Spotify!</p>
					<p className='mb-3'>
						Please log in with your Spotify account, then you can start creating
						groups with friends!
					</p>
					<div className=''>
						<a
							className='button is-primary is-size-4'
							onClick={e => e.target.classList.add('is-loading')}
							href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`}>
							Log in with Spotify
						</a>
					</div>
				</div>
				{isTimeout ? (
					<div
						className='card my-4 p-5 has-background-danger-light has-text-centered'
						style={{ width: '50%', margin: 'auto' }}>
						<p>You have been logged out, please login in with Spotify again.</p>
					</div>
				) : null}
			</div>
		</div>
	);
}

export default Login;
