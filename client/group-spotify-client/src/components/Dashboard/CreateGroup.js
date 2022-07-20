import axios from 'axios';
import React, { useContext, useState } from 'react'
import UserContext from '../../contexts/UserContext';

function CreateGroup({ show, setShow, fetchGroups }) {

    const [isSuccess, setSuccess] = useState(null);
    const [groupNameInput, setGroupNameInput] = useState("");

    const { userID, URI_ENDPOINT } = useContext(UserContext);

    const hide = () => {
        setShow(false);
    }

    const createGroup = async () => {
        const res = await axios.post(URI_ENDPOINT + '/addGroup', { userID: userID, name: groupNameInput });
        console.log("Response creating group", res);
        setSuccess(res.status === 200);
        setGroupNameInput("");
        hide();
        fetchGroups();
    }

    if (!show) return;

    return (
        <div className='container'>
            <div className='field'>
                <label className='label'>
                    Group Name
                </label>
                <input className='input' type='text' onChange={e => setGroupNameInput(e.target.value)} value={groupNameInput} autoFocus />
            </div>
            <div className='field'>
                <button className='button is-primary mr-3' onClick={createGroup}>Create</button>
                <button className='button is-link' onClick={hide}>Cancel</button>
            </div>
            {isSuccess != null ?? <Message isSuccess={isSuccess} />}
        </div>
    )
}

function Message({ isSuccess }) {

    const showMessage = () => {
        if (isSuccess) {
            return "Group was succesfully created!";
        } else {
            return "An error ocurred creating a new group, please try again";
        }
    }

    if (isSuccess == null) return;

    return (
        <div>
            <p>
                {showMessage()}
            </p>
        </div>
    )
}

export default CreateGroup