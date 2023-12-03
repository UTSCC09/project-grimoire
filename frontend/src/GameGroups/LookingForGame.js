import React, {useState, useEffect} from "react"
import { Button, TextField, Select, MenuItem, Box, Typography, Grid, Card, CardContent } from "@mui/material";
import { getGroups } from "../api.mjs"
import "../styling/general.css"
import { URL } from "../api.mjs";

function getPrefString(prefObj){
    let str = ""
    for(let key in prefObj){
        str += `${key}: ${prefObj[key]} `
    }
    return str
}

function LookingForGame(props) {
  const [success, setSuccess] = useState(false);
  const [hasLoaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [groups, setGroups] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [gameId, setGameId] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    fetchData();
  }, [searchTerm, filterType, gameId, userId]);

  const fetchData = async () => {
    try {
      let endpoint = `${URL}/api/groups/page`;

      if (filterType === "game") {
        endpoint = `/api/groups/game/${gameId}/page`;
      } else if (filterType === "user_owner") {
        endpoint = `/api/groups/user/${userId}/owner/page`;
      } else if (filterType === "user_member") {
        endpoint = `/api/groups/user/${userId}/member/page`;
      } else if (filterType === "preferences") {
        endpoint = `/api/groups/preferences/page`;
      } else if (filterType === "location") {
        endpoint = `/api/groups/location/page`;
      }
      const response = await fetch(`${endpoint}?page=${currentPage}&search=${searchTerm}`,{
        credentials: 'include',
        method: 'GET',
      });

      const json = await response.json();
      console.log('json', json)
      setGroups(json);
      setSuccess(true);
      setLoaded(true);
    } catch (error) {
      setError(true);
    }
  };

  return (
    <Grid item container xs={12} className="full" flexDirection="column" spacing={1}>
      <Typography variant="h1">Group List</Typography>
      <Grid item container xs={12}>
        <TextField
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          value={filterType}
          label="Sort By"
          onChange={(e) => setFilterType(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="game">By Game</MenuItem>
          <MenuItem value="user_owner">By User (Owner)</MenuItem>
          <MenuItem value="user_member">By User (Member)</MenuItem>
          <MenuItem value="preferences">By Preferences</MenuItem>
          <MenuItem value="location">By Location</MenuItem>
        </Select>
        {filterType === "game" && (
          <TextField
            type="text"
            placeholder="Game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
          />
        )}
        {["user_owner", "user_member"].includes(filterType) && (
          <TextField
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        )}
      </Grid>
      <Grid item container xs={12} spacing={1}>
        {groups.map((group) => (
          <Grid item container xs={4}>
            <Card sx={{border: '1px red solid', width:'100%'}} borderColor="secondary.main">
              <CardContent>
                <Typography key={group.id}>{group.name}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid item container>
        <Button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Typography>{`Page ${currentPage}`}</Typography>
        <Button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={groups.length === 0}
        >
          Next
        </Button>
      </Grid>
    </Grid>
  );
}

export default LookingForGame;