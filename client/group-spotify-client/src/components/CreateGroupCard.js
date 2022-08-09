import React from 'react';
import CreateGroup from './Dashboard/CreateGroup';

function CreateGroupCard({ show, setShow, fetchGroups }) {
	return (
		<div className='card p-4' style={{ width: '18rem' }}>
			<CreateGroup
				show={show}
				setShow={setShow}
				fetchGroups={fetchGroups}></CreateGroup>
		</div>
	);
}

export default CreateGroupCard;
