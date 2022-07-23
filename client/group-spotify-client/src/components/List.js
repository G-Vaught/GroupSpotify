import React, { useState } from 'react'

function List() {

    const [filter, setFilter] = useState("");

    const listOfStuff = [];

    return (
        <div>
            <input type={"text"} onChange={e => setFilter(e.target.value)}></input>

            <table>
                <tbody>
                    {
                        listOfStuff?.map(stuff => stuff.name.includes(filter)).map(stuff => {
                            return <tr>
                                <td>stuff.field</td>
                            </tr>
                        })
                    }
                </tbody>
            </table>
        </div>
    )
}

export default List