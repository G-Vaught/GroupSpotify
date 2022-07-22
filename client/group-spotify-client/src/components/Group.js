import axios from 'axios';
import React, { useContext, useState } from 'react'
import { IoCopy, IoCheckmark } from 'react-icons/io5'
import ReactTooltip from 'react-tooltip';
import UserContext from '../contexts/UserContext';

function Group({ group, isOwner, fetchGroups }) {

    const [displayUsers, setDisplayUsers] = useState(false);
    const [linkCopied, setLinkCopied] = useState("Copy to clipboard")
    const [doDelete, setDoDelete] = useState(false);
    const [showTooltip, setShowTooltip] = useState(true);
    const [hasCopied, setHasCopied] = useState(false);

    const { userID, accessToken, URI_ENDPOINT } = useContext(UserContext);

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
                    return <tr key={user.user._id}>
                        <td >{user.user.name} {group.owner._id === user.user._id && " - Owner"}</td>
                    </tr>
                })}
            </tbody>
        </table>
    }

    const copyToClipboard = () => {
        copy(window.location.href + '?joinGroup=' + group._id);
        setShowTooltip(false)
        setLinkCopied("Link copied!");
        setShowTooltip(true);
        setHasCopied(true);
    }

    const copy = text => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Unable to copy to clipboard', err);
        }
        document.body.removeChild(textArea);
    }

    const deleteGroup = async () => {
        await axios.post(URI_ENDPOINT + "/deleteGroup", { groupID: group._id, userID: userID, accessToken });
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

    const leaveGroup = async button => {
        button.classList.add("is-loading");
        const leaveGroupRes = await axios.post(URI_ENDPOINT + '/leaveGroup', { userID: userID, groupID: group._id, accessToken });
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
                    <button className='button is-primary is-small' data-tip={linkCopied} data-effect="solid" onClick={copyToClipboard}>{hasCopied ? <IoCheckmark size={20} /> : <IoCopy size={20} />}</button>
                    {showTooltip && <ReactTooltip />}
                </div>
                {isOwner ?
                    !displayUsers
                        ? <button className='button is-link mt-2' onClick={e => setDisplayUsers(true)}>Display Users</button>
                        : <button className='button is-warning mt-2' onClick={e => setDisplayUsers(false)}>Hide Users</button>
                    : <button className='button is-link mt-2' onClick={e => leaveGroup(e.target)}>Leave Group</button>}
                {displayUsers && showUsers()}
                {isOwner ? !doDelete ? <button className='button is-danger mt-3' style={{ "width": "50%", "marginLeft": "25%" }} onClick={e => setDoDelete(true)}>Delete group</button> : confirmDelete() : null}
            </div >
        </div >
    )
}

export default Group