import React, {useState, useEffect} from "react"
import {Button} from "@mui/material"
import { getGroups } from "../api.mjs"

function getPrefString(prefObj){
    let str = ""
    for(let key in prefObj){
        str += `${key}: ${prefObj[key]} `
    }
    return str
}

function LookingForGame(props){

    const [success, setSuccess] = useState(false)
    const [hasLoaded, setLoaded] = useState(false)
    const [error, setError] = useState(false)
    const [groups, setGroups] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [gameId, setGameId] = useState('');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        fetchData();
    }, [currentPage, searchTerm, filterType, gameId, userId]);

    const fetchData = async () => {
        try {
            let endpoint = "/api/groups/page";

            if (filterType === "game") {
                endpoint = "/api/groups/game/${gameId}/page";
            } else if (filterType === 'user_owner') {
                endpoint = `/api/groups/user/${userId}/owner/page`;
            } else if (filterType === 'user_member') {
                endpoint = `/api/groups/user/${userId}/member/page`;
            } else if (filterType === 'preferences') {
                endpoint = `/api/groups/preferences/page`;
            } else if (filterType === 'location') {
                endpoint = `/api/groups/location/page`;
            }

            const response = await fetch(`${endpoint}?page=${currentPage}&search=${searchTerm}`);

            const json = await response.json();
            setGroups(json);
            setSuccess(true);
            setLoaded(true);
        } catch (error) {
            setError(true);
        }
    };

    return (
        <div>
          <h1>Group List</h1>
          <div>
            <input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All</option>
              <option value="game">By Game</option>
              <option value="user_owner">By User (Owner)</option>
              <option value="user_member">By User (Member)</option>
              <option value="preferences">By Preferences</option>
              <option value="location">By Location</option>
            </select>
            {filterType === 'game' && (
              <input type="text" placeholder="Game ID" value={gameId} onChange={(e) => setGameId(e.target.value)} />
            )}
            {['user_owner', 'user_member'].includes(filterType) && (
              <input type="text" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
            )}
          </div>
          <ul>
            {groups.map((group) => (
              <li key={group.id}>{group.name}</li>
            ))}
          </ul>
          <div>
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </button>
            <span>{`Page ${currentPage} of ${totalPages}`}</span>
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </div>
    );
}

export default LookingForGame