import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import UserContext from '../contexts/UserContext';
import DisplayGroups from './DisplayGroups';
import Navbar from './Navbar';

function Dashboard({
	accessToken,
	logout,
	doUpdateGroups,
	groupSkeletons,
	pushLoadingSkeletons,
	removeLoadingSkeletons,
}) {
	const [groups, setGroups] = useState([]);

	const { userID, URI_ENDPOINT } = useContext(UserContext);

	useEffect(() => {
		if (accessToken) {
			fetchGroups();
		}
	}, [userID, doUpdateGroups]);

	const fetchGroups = (button) => {
		setGroups([]);
		pushLoadingSkeletons();
		button?.classList.add('is-loading');
		if (!userID) return;
		axios
			.post(URI_ENDPOINT + '/getGroupsByUser', { userID, accessToken })
			.then((groups) => {
				console.log('Groups', groups.data);
				setGroups(groups.data);
				button?.classList.remove('is-loading');
				removeLoadingSkeletons();
			})
			.catch((err) => {
				console.log('Error loading groups', err.message);
				removeLoadingSkeletons();
			});
	};

	return (
		<div>
			<Navbar accessToken={accessToken} logout={logout} />
			<div className='container'>
				<div>
					<div className=''>
						<div className='m-4 p-5'>
							<p className='is-size-5 mb-3 p-5 card'>
								Welcome to Group Spotify! Join groups made by your friends and
								get a Spotify playlist made up of everyone's recent songs.
								Create a new group below to get started, or join a group with a
								link sent by a friend!
							</p>
							<div className='mt-5 is-flex is-flex-direction-column is-justify-content-space-between'>
								<DisplayGroups
									groups={groups}
									fetchGroups={fetchGroups}
									groupSkeletons={groupSkeletons}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Dashboard;
