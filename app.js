const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBandServer = async () => {
try {
db = await open({
filename: dbPath,
driver: sqlite3.Database,
});
app.listen(3000, () => {
console.log("server is running");
});
} catch (e) {
console.log(`DB Error: ${e.message}`);
process.exit(1);
}
};
initializeDBandServer();

// get all player
const convertDbObjectToResponseObject = (dbObject) => {
return {
playerId: dbObject.player_id,
playerName: dbObject.player_name,
jerseyNumber: dbObject.jersey_number,
role: dbObject.role,
};
};
app.get("/players/", async (request, response) => {
const getAllPlayer = `
SELECT *
FROM cricket_team


`;
const player = await db.all(getAllPlayer);
response.send(
player.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
);
});

// add
app.post("/players/", async (request, response) => {
const playerDetails = request.body;
const { playerName, jerseyNumber, role } = playerDetails;
const addPlayerDetails = `
INSERT INTO
cricket_team(player_name,jersey_number,role)
VALUES
(
'${playerName}',
${jerseyNumber},
'${role}'

); `;
const dbResponse = await db.run(addPlayerDetails);
const playerId = dbResponse.player_id;
response.send("Player Added to Team");
});

// return player
app.get("/players/:playerId/", async (request, response) => {
const { playerId } = request.params;
const getPlayerQuery = `
SELECT *
FROM
cricket_team
WHERE
player_id=${playerId};
`;
const player = await db.get(getPlayerQuery);
response.send({
playerId: player.player_id,
playerName: player.player_name,
jerseyNumber: player.jersey_number,
role: player.role,
});
});

//update
app.put("/players/:playerId/", async (request, response) => {
const { playerId } = request.params;
const playerDetails = request.body;
const { playerName, jerseyNumber, role } = playerDetails;
const updateQuery = `
UPDATE
cricket_team
SET
player_name='${playerName}',
jersey_number=${jerseyNumber},
role='${role}'
WHERE
player_id=${playerId};
`;
await db.run(updateQuery);
response.send("Player Details Updated");
});
// delete
app.delete("/players/:playerId/", async (request, response) => {
const { playerId } = request.params;
const deleteQuery = `
DELETE FROM
cricket_team
where player_id=${playerId};
`;
await db.run(deleteQuery);
response.send("Player Removed");
});

module.exports = app;