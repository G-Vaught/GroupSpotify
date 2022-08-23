import React, { useContext, useRef, useState } from 'react';
import { GrGroup } from 'react-icons/gr';
import UserContext from '../contexts/UserContext';

function Navbar({ accessToken, logout }) {
	const { userName } = useContext(UserContext);
	const [showMenu, setShowMenu] = useState(false);

	const menuRef = useRef();
	const burgerRef = useRef();

	//TODO: Don't refresh the page.
	const handleLogout = () => {
		logout();
	};

	const toggleMenu = e => {
		e.preventDefault();
		if (showMenu) {
			menuRef.current.classList.remove('is-active');
			burgerRef.current.classList.remove('is-active');
		} else {
			menuRef.current.classList.add('is-active');
			burgerRef.current.classList.add('is-active');
		}
		setShowMenu(prev => !prev);
	};

	return (
		<nav className='navbar is-dark'>
			<div className='container'>
				<div className='navbar-brand'>
					<div className='navbar-item'>
						<div className='is-flex' style={{ fontSize: 'max(100%, 2vmax)' }}>
							<span
								className='mr-2 is-flex is-align-items-center navIcon'
								style={{ verticalAlign: 'bottom' }}>
								<GrGroup stroke='white' style={{ stroke: 'white' }}></GrGroup>
							</span>
							Group Spotify
						</div>
					</div>

					<a
						role='button'
						className='navbar-burger'
						aria-label='menu'
						aria-expanded='false'
						data-target='navbarBasic'
						onClick={e => toggleMenu(e)}
						ref={burgerRef}
						style={{ height: 'auto' }}>
						<span aria-hidden='true'></span>
						<span aria-hidden='true'></span>
						<span aria-hidden='true'></span>
					</a>
				</div>

				<div id='navbarBasic' className='navbar-menu' ref={menuRef}>
					<div className='navbar-end'>
						<div className='navbar-item'>
							<div className='buttons'>
								<a
									href='https://github.com/G-Vaught/GroupSpotify'
									target='_blank'
									rel='noreferrer'
									className='button is-primary is-outlined mr-2'>
									GitHub &#10084;&#65039;
								</a>
								{accessToken && (
									<button className='button is-danger' onClick={handleLogout}>
										Logout
									</button>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
}

export default Navbar;
