import React, { useContext, useRef, useState } from 'react';
import UserContext from '../contexts/UserContext';
import { GrGroup } from 'react-icons/gr'

function Navbar({ accessToken, logout }) {

    const { userName } = useContext(UserContext);
    const [showMenu, setShowMenu] = useState(false);

    const menuRef = useRef();
    const burgerRef = useRef();

    //TODO: Don't refresh the page.
    const handleLogout = () => {
        logout();

    }

    const toggleMenu = e => {
        e.preventDefault();
        if (showMenu) {
            menuRef.current.classList.remove("is-active");
            burgerRef.current.classList.remove("is-active");
        } else {
            menuRef.current.classList.add("is-active");
            burgerRef.current.classList.add("is-active");
        }
        setShowMenu(prev => !prev);
    }

    return (
        <nav className='navbar is-dark'>
            <div className='container'>
                <div className='navbar-brand'>
                    <div className='navbar-item'>
                        <div className='is-size-1 is-flex'>
                            <span className='mr-2 is-flex is-align-items-center navIcon' style={{ verticalAlign: "bottom" }}><GrGroup stroke='white' style={{ stroke: "white" }}></GrGroup></span>
                            Group Spotify
                        </div>
                    </div>


                    <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasic" onClick={e => toggleMenu(e)} ref={burgerRef} style={{ height: "auto" }}>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                    </a>
                </div>

                <div id="navbarBasic" class="navbar-menu" ref={menuRef}>
                    <div className="navbar-end">
                        <div className='navbar-item'>
                            <div className='buttons'>
                                <a href='https://github.com/G-Vaught/GroupSpotify' target="_blank" rel='noreferrer' className='button is-primary is-outlined mr-2'>GitHub &#10084;&#65039;</a>
                                {
                                    accessToken && <button className='button is-danger' onClick={handleLogout}>Logout</button>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav >
    )

    return (
        <div style={{ backgroundColor: "white", boxShadow: "1px 1px 10px 2px grey" }}>
            <div className='container is-flex is-flex-direction-row' >
                <div className='is-align-self-start' style={{ flexGrow: "1" }}>
                    <p className='is-size-1'>Group Spotify</p>
                </div>
                <div className='is-align-self-center'>
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