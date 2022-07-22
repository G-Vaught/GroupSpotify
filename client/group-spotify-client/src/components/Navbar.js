import React, { useContext } from 'react';
import UserContext from '../contexts/UserContext';

function Navbar({ accessToken, logout }) {

    const { userName } = useContext(UserContext);

    //TODO: Don't refresh the page.
    const handleLogout = () => {
        logout();

    }


    return (
        <div style={{ backgroundColor: "white" }}>
            <div className='container is-flex is-flex-direction-row' >
                <div className='is-align-self-start'>
                    <p className='is-size-1'>Group Spotify</p>
                </div>
                <div className='is-align-self-center' style={{ marginLeft: "auto" }}>
                    <a href='https://github.com/G-Vaught/GroupSpotify' target="_blank" rel='noreferrer' className='button is-link is-outlined mr-2'>GitHub &#10084;&#65039;</a>
                    {
                        accessToken && <button className='button is-danger' onClick={handleLogout}>Logout</button>
                    }
                </div>
            </div>
        </div>
    )
}

export default Navbar