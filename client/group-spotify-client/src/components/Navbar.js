import React, { useContext } from 'react';
import UserContext from '../contexts/UserContext';

function Navbar({ accessToken, logout }) {

    const { userName } = useContext(UserContext);

    //TODO: Don't refresh the page.
    const handleLogout = () => {
        logout();

    }


    return (
        <div className='is-flex is-flex-direction-row'>
            <div className='is-align-self-start'>
                <p className='is-size-1'>Group Spotify</p>
            </div>
            <div className='is-align-self-center' style={{ marginLeft: "auto" }}>
                {
                    accessToken && <button className='button is-danger' onClick={handleLogout}>Logout</button>
                }

            </div>
        </div>
    )
}

export default Navbar