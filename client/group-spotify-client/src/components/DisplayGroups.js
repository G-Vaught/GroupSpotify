import React, { useContext } from 'react'
import UserContext from '../contexts/UserContext';
import Group from './Group'

function DisplayGroups({ groups, fetchGroups }) {

    const { userID } = useContext(UserContext);

    return (
        <div>
            <div className='mb-5'>
                <p className='is-size-3'>Groups you have created</p>
                <hr></hr>
                <div className='is-flex is-flex-direction-row is-flex-wrap-wrap is-align-items-start' style={{ "gap": "2em" }}>
                    {groups?.filter(group => group.owner.userID === userID)?.map(group => <Group group={group} isOwner key={group._id} fetchGroups={fetchGroups} />)}
                </div>
            </div>

            <div>
                <p className='is-size-3'>Groups you have joined</p>
                <hr></hr>
                <div className='is-flex is-flex-direction-row is-flex-wrap-wrap is-align-items-start' style={{ "gap": "2em" }}>
                    {groups?.filter(group => group.owner.userID !== userID && group.users?.filter(user => user.user.userID === userID).length >= 1)?.map(group => <Group group={group} key={group._id} />)}
                </div>
            </div>
        </div>
    )
}

export default DisplayGroups