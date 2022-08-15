const { getYahooLeagueClient, getEspnLeagueClient } = require('./espnClient');
const { getSet } = require('../../utils/cache');
const logger = require('../../utils/logger');

function constructTeam(teamData) {
  return {
    id: teamData.id,
    name: `${teamData.location} ${teamData.nickname}`,
    ownerId: teamData.primaryOwner,
  };
}

function constructTeams(teams) {
  return teams.reduce((teamMap, team) => {
    const clonedTeamMap = { ...teamMap };

    const constructedTeam = constructTeam(team);
    clonedTeamMap[constructedTeam.id] = constructedTeam;

    return clonedTeamMap;
  }, {});
}

function parseResponse(response) {
  return {
    teams: constructTeams(response.teams),
  };
}

async function fetchTeams({ client, season, week }) {
  const response = await client
    .getTeamsAtWeek({ season, week })
    .catch(logger.error);
  return parseResponse(await response.json()).teams;
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
      fetchTeams({ client: getEspnLeagueClient(), season, week }),
  });
}

async function fetchYahooTeams({ season, week }) {
  return getSet({
    key: `fetchYahooTeams.${season}.${week}`,
    ttl: 60 * 60 * 24,
    loader: async () =>
      fetchTeams({ client: getYahooLeagueClient(), season, week }),
  });
}

module.exports = {
  fetchYahooTeams,
  fetchEspnTeams,
};
