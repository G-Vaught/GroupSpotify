import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import UserContext from '../contexts/UserContext';
import CreateGroup from './Dashboard/CreateGroup';
import DisplayGroups from './DisplayGroups';
import Navbar from './Navbar';

function Dashboard({ accessToken, logout, doUpdateGroups, groupSkeletons, pushLoadingSkeletons, removeLoadingSkeletons }) {

    const [groups, setGroups] = useState([]);
    const [createGroupVisible, setCreateGroupVisible] = useState(false);

    const { userID, URI_ENDPOINT } = useContext(UserContext);

    console.log("dashboard userid ", userID);

    useEffect(() => {
        fetchGroups();
    }, [userID, doUpdateGroups])

    const fetchGroups = button => {
        setGroups([]);
        pushLoadingSkeletons();
        button?.classList.add('is-loading');
        console.log("Getting user groups", userID);
        if (!userID) return;
        axios.post(URI_ENDPOINT + '/getGroupsByUser', { userID, accessToken })
            .then(groups => {
                console.log("Groups", groups.data);
                setGroups(groups.data);
                button?.classList.remove('is-loading');
                removeLoadingSkeletons();
            })
            .catch(err => {
                console.log("Error loading groups", err.message);
                removeLoadingSkeletons();
            });
    }

    const createGroup = () => {
        setCreateGroupVisible(true);
    }

    return (
        <div >
            <Navbar accessToken={accessToken} logout={logout} />
            <div className="container">
                <div>
                    <div className='card'>
                        <div className='m-4 p-5'>
                            <p className='is-size-5 mb-3    '>
                                Welcome to Group Spotify! Join groups made by your friends and get a Spotify playlist made up of everyone's recent songs.
                                Create a new group below to get started, or join a group with a link sent by a friend!
                            </p>
                            <div className='card p-4'>
                                <div className='is-flex is-flex-direction-row is-justify-content-center' style={{ gap: "1rem" }}>
                                    <button className='button is-primary modal-button' onClick={createGroup}>Create a new Group</button>
                                    <button className='button is-primary' onClick={e => fetchGroups(e.target)}>Reload Groups</button>
                                </div>
                                <CreateGroup show={createGroupVisible} setShow={setCreateGroupVisible} fetchGroups={fetchGroups}></CreateGroup>
                            </div>
                            <div className='mt-5 is-flex is-flex-direction-column is-justify-content-space-between'>
                                <DisplayGroups groups={groups} fetchGroups={fetchGroups} groupSkeletons={groupSkeletons} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    )
}

export default Dashboard