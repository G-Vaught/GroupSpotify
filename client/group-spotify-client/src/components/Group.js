import axios from 'axios';
import React, { useContext, useState } from 'react'
import { IoCopy } from 'react-icons/io5'
import { useLocation } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import UserContext from '../contexts/UserContext';

function Group({ group, isOwner, fetchGroups }) {

    const [displayUsers, setDisplayUsers] = useState(false);
    const [linkCopied, setLinkCopied] = useState("Copy to clipboard")
    const [doDelete, setDoDelete] = useState(false);

    const { userID, accessToken } = useContext(UserContext);

    const showUsers = () => {
        if (!displayUsers || !isOwner) return;
        return <table className='table is-striped is-bordered'>
            <thead>
                <tr>
                    <th>Users</th>
                </tr>
            </thead>
            <tbody>
                {group.users?.map(user => {
                    return <tr>
                        <td key={user.user._id}>{user.user.name} {group.owner._id === user.user._id && " - Owner"}</td>
                    </tr>
                })}
            </tbody>
        </table>
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href + '?joinGroup=' + group._id);
        setLinkCopied("Link copied!");
    }

    const deleteGroup = async () => {
        await axios.post("http://localhost:5000/deleteGroup", { groupID: group._id, userID: userID, accessToken });
        fetchGroups();
    }

    const confirmDelete = () => {
        return (
            <div className='mt-3'>
                <p className='has-text-centered'>Are you sure you want to delete this group?</p>
                <div className='is-flex is-flex-direction-row is-align-items-center is-justify-content-center' style={{ "gap": "1em" }}>
                    <button className='button is-danger' onClick={deleteGroup}>Yes, Delete</button>
                    <button className='button is-primary' onClick={e => setDoDelete(false)}>Go back</button>
                </div>
            </div>
        );
    }

    const leaveGroup = async () => {
        const leaveGroupRes = await axios.post('http://localhost:5000/leaveGroup', { userID: userID, groupID: group._id, accessToken });
        console.log("Left Group", leaveGroupRes);
        fetchGroups();
    }

    return (
        <div className='card p-4'>
            <div className='is-flex is-flex-direction-column'>
                <p className='is-size-5 has-text-weight-bold'>{group.name}</p>
                <p className='has-text-grey-light'>{group.owner.name}</p>
                <p>Number of users: {group.users?.length | 0} of 20</p>
                <div className='is-flex is-flex-direction-row is-align-items-center'>
                    <p className='mr-1'>Link to join:</p>
                    <p><input className='input is-small' type='text' disabled value={window.location.href + '?joinGroup=' + group._id} /></p>
                    <button className='button is-primary is-small' data-tip={linkCopied} data-effect="solid" onClick={copyToClipboard}><IoCopy size={20} /></button>
                    <ReactTooltip />
                </div>
                {isOwner ?
                    !displayUsers
                        ? <button className='button is-link mt-2' onClick={e => setDisplayUsers(true)}>Display Users</button>
                        : <button className='button is-warning mt-2' onClick={e => setDisplayUsers(false)}>Hide Users</button>
                    : <button className='button is-link mt-2' onClick={leaveGroup}>Leave Group</button>}
                {displayUsers && showUsers()}
                {isOwner ? !doDelete ? <button className='button is-danger mt-3' style={{ "width": "50%", "marginLeft": "25%" }} onClick={e => setDoDelete(true)}>Delete group</button> : confirmDelete() : null}
            </div >
        </div >
    )
}

export default Group