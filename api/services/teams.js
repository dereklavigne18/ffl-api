const { logger } = require('../utils/logger');
const { getObjectValues } = require('../utils/polyfills');

const { fetchEspnTeams, fetchYahooTeams } = require('./espnApi/teamsClient');
const { getUserById } = require('./users');

// async function getAllTeams({ season, week }) {
//   // TODO add caching layer
//   return liveLoadAllTeams({ season, week });
// }
//
// async function liveLoadAllTeams({ season, week }) {
//   const teams = fetchAllTeams({ season, week });
//   return teams.map(team => ({
//     ...team,
//     owner: getUserById(team.ownerId),
//   }));
// }

function addOwnerToTeam(team) {
  return {
    ...team,
    owner: getUserById(team.ownerId),
  };
}

function addOwnerToTeamInTeamMap(teamMap, team) {
  const clonedTeamMap = { ...teamMap };
  const teamWithOwner = addOwnerToTeam(team);
  clonedTeamMap[teamWithOwner.id] = teamWithOwner;

  return clonedTeamMap;
}

function addOwnersToTeams(teams) {
  return getObjectValues(teams).reduce(addOwnerToTeamInTeamMap, {});
}

async function getEspnTeams({ season, week }) {
  return addOwnersToTeams(await fetchEspnTeams({ season, week }));
}

async function getYahooTeams({ season, week }) {
  return addOwnersToTeams(await fetchYahooTeams({ season, week }));
}

module.exports = {
  getEspnTeams,
  getYahooTeams,
};
