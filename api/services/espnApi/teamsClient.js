const { getYahooLeagueClient, getEspnLeagueClient } = require('./espnClient');
const { getSet } = require('../../utils/cache');
const logger = require('../../utils/logger');

function constructTeam(teamData, leagueName) {
  return {
    id: `${leagueName}:${teamData.id}`,
    name: `${teamData.location} ${teamData.nickname}`,
    ownerId: teamData.primaryOwner,
  };
}

function constructTeams(teams, leagueName) {
  return teams.reduce((teamMap, team) => {
    const clonedTeamMap = { ...teamMap };

    const constructedTeam = constructTeam(team, leagueName);
    clonedTeamMap[constructedTeam.id] = constructedTeam;

    return clonedTeamMap;
  }, {});
}

function parseResponse(response, leagueName) {
  return {
    teams: constructTeams(response.teams, leagueName),
  };
}

async function fetchTeams({ leagueName, season, week }) {
  const client = leagueName == "ESPN" ? getEspnLeagueClient() : getYahooLeagueClient();

  const response = await client
    .getTeamsAtWeek({ season, week })
    .catch(logger.error);
  return parseResponse(await response.json(), leagueName).teams;
}

// Both of the below function return data in the format:
// {
//   1: {
//     id: 1,
//     name: '2 Squids 1 Dress',
//     ownerId: '{123xyz}'
//   }
//   ...
// }

async function fetchEspnTeams({ season, week }) {
  return getSet({
    key: `fetchEspnTeams.${season}.${week}`,
    ttl: 60 * 60 * 24,
    loader: async () =>
      fetchTeams({ leagueName: "ESPN", season, week }),
  });
}

async function fetchYahooTeams({ season, week }) {
  return getSet({
    key: `fetchYahooTeams.${season}.${week}`,
    ttl: 60 * 60 * 24,
    loader: async () =>
      fetchTeams({ leagueName: "YAHOO", season, week }),
  });
}

module.exports = {
  fetchYahooTeams,
  fetchEspnTeams,
};
