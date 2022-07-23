import React from 'react'

function GroupSkeleton({ isOwner }) {
    return (
        <div className='card p-4'>
            <div style={{ width: "15rem" }}>

                <div className='is-flex is-flex-direction-column'>
                    <div className='skeleton skeleton-text'></div>
                    <div className='skeleton skeleton-text'></div>
                    <div className='skeleton skeleton-text'></div>
                    <div className='skeleton skeleton-text'></div>
                    <div className='skeleton skeleton-text skeleton-text__body'></div>
                    <div className='skeleton skeleton-text skeleton-text__Lowerbody'></div>
                </div >
            </div>
        </div>
    )
}

export default GroupSkeleton