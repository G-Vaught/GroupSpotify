import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import UserContext from '../contexts/UserContext';
import CreateGroup from './Dashboard/CreateGroup';
import DisplayGroups from './DisplayGroups';
import Navbar from './Navbar';

function Dashboard({ accessToken, logout }) {

    const [groups, setGroups] = useState([]);
    const [createGroupVisible, setCreateGroupVisible] = useState(false);

    const { userID } = useContext(UserContext);

    console.log("dashboard userid ", userID);

    useEffect(() => {
        fetchGroups();
    }, [userID])

    const fetchGroups = () => {
        console.log("Getting user groups", userID);
        if (!userID) return;
        axios.post('http://localhost:5000/getGroupsByUser', { userID, accessToken })
            .then(groups => {
                console.log("Groups", groups.data);
                setGroups(groups.data);
            });
    }

    const updatePlaylists = async () => {
        const updateResponse = await axios.post('http://localhost:5000/updatePlaylists', { userID, accessToken });
        console.log("Updated Playlists", updateResponse);
    }

    const createGroup = () => {
        setCreateGroupVisible(true);
    }

    return (
        <div >
            <div className="container">
                <Navbar accessToken={accessToken} logout={logout} />
                <div>
                    <div className='card'>
                        <div className='m-4 p-5'>
                            <p className='is-size-5'>
                                Welcome to Group Spotify! Join groups made by your friends and get a Spotify playlist made up of everyone's recent songs!
                            </p>
                            <div className='mt-5 is-flex is-flex-direction-row is-justify-content-center' style={{ gap: "1rem" }}>
                                <button className='button is-primary modal-button' onClick={createGroup}>Create a new Group</button>
                                <button className='button is-primary' onClick={fetchGroups}>Reload Groups</button>
                                <button className='button is-danger' onClick={updatePlaylists}>Update Playlists</button>
                            </div>
                            <CreateGroup show={createGroupVisible} setShow={setCreateGroupVisible} fetchGroups={fetchGroups}></CreateGroup>
                            <div className='mt-5 is-flex is-flex-direction-column is-justify-content-space-between'>
                                <DisplayGroups groups={groups} fetchGroups={fetchGroups} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    )
}

export default Dashboard