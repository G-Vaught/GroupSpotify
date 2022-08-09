import React, { useContext, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import UserContext from '../contexts/UserContext';
import CreateGroupCard from './CreateGroupCard';
import Group from './Group';
import GroupSkeleton from './GroupSkeleton';

function DisplayGroups({ groups, fetchGroups, groupSkeletons }) {
	const { userID } = useContext(UserContext);
	const [showCreateGroup, setShowCreateGroup] = useState(false);

	return (
		<div>
			<div className='mb-5 p-4 card'>
				<div
					className='is-flex-direction-row'
					style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
					<p className='is-size-3' style={{ flexGrow: '1' }}>
						Groups you have created
					</p>
					<button
						className='button is-link is-align-self-center'
						onClick={(e) => fetchGroups(e.target)}>
						Refresh{' '}
						<span className='ml-2 is-flex'>
							<FiRefreshCw size={20} />
						</span>
					</button>
					<button
						className='button is-primary is-align-self-center'
						onClick={(e) => setShowCreateGroup(true)}>
						Create New Group
					</button>
				</div>
				<hr></hr>
				<div
					className='is-flex is-flex-direction-row is-flex-wrap-wrap is-align-items-start'
					style={{ gap: '2em' }}>
					{showCreateGroup ? (
						<CreateGroupCard
							show={showCreateGroup}
							setShow={setShowCreateGroup}
							fetchGroups={fetchGroups}
						/>
					) : null}
					{groups
						?.filter((group) => group.owner.userID === userID)
						?.map((group) => (
							<Group
								group={group}
								isOwner
								key={group._id}
								fetchGroups={fetchGroups}
							/>
						))}
					{groupSkeletons
						?.filter((skeleton) => skeleton.isOwner)
						.map((skeleton) => (
							<GroupSkeleton></GroupSkeleton>
						))}
				</div>
			</div>

			<div className='p-4 card'>
				<p className='is-size-3'>Groups you have joined</p>
				<hr></hr>
				<div
					className='is-flex is-flex-direction-row is-flex-wrap-wrap is-align-items-start'
					style={{ gap: '2em' }}>
					{groups
						?.filter(
							(group) =>
								group.owner.userID !== userID &&
								group.users?.filter((user) => user.user.userID === userID)
									.length >= 1
						)
						?.map((group) => (
							<Group group={group} key={group._id} fetchGroups={fetchGroups} />
						))}
					{groupSkeletons
						?.filter((skeleton) => !skeleton.isOwner)
						.map((skeleton) => (
							<GroupSkeleton></GroupSkeleton>
						))}
				</div>
			</div>
		</div>
	);
}

export default DisplayGroups;
