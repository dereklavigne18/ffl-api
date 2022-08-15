const { getEspnLeagueClient, getYahooLeagueClient } = require('./espnClient');
const { getSet } = require('../../utils/cache');
const { logger } = require('../../utils/logger');

function constructTeamScore(teamScore) {
  let pointsLive = 0;
  if (teamScore.totalPointsLive) {
    pointsLive = +teamScore.totalPointsLive.toFixed(1);
  }

  return {
    teamId: teamScore.teamId,
    points: +teamScore.totalPoints.toFixed(1),
    pointsLive,
  };
}

function constructBoxscore(boxscore) {
  return {
    home: constructTeamScore(boxscore.home),
    away: 'away' in boxscore ? constructTeamScore(boxscore.away) : null,
  };
}

function constructBoxscores(schedule) {
  return schedule.reduce((boxscores, score) => {
    const scores =
      score.matchupPeriodId in boxscores
        ? boxscores[score.matchupPeriodId]
        : [];
    scores.push(constructBoxscore(score));

    const clonedBoxscores = { ...boxscores };
    clonedBoxscores[score.matchupPeriodId] = scores;

    return clonedBoxscores;
  }, {});
}

function parseResponse(response) {
  return {
    boxscores: constructBoxscores(response.schedule),
  };
}

async function fetchBoxscores({ client, season, week }) {
  const response = await client
    .getBoxscoresAtWeek({ season, week })
    .catch(logger.error);
  return parseResponse(await response.json()).boxscores;
}

// Both of the below function return data in the format:
// {
//   1: [
//     {
//       home: {
//         teamId: 4,
//         points: 101.7
//       },
//       away: { // Away is optional since by weeks won't include away teams
//         teamId: 7,
//         points: 98.3
//       }
//     }
//   ],
//   ...
// }

/**
 * Gets all the boxscores for the espn league over the year provided
 *
 * @param season
 * @param week
 * @returns {Promise<*>}
 */
async function fetchEspnBoxscores({ season, week }) {
  logger.debug(`fetchEspnBoxscores({ season: ${season}, week: ${week} })`);
  return getSet({
    key: `fetchEspnBoxscores.${season}.${week}`,
    ttl: 60 * 60,
    loader: async () =>
      fetchBoxscores({ client: getEspnLeagueClient(), season, week }),
  });
}

/**
 * Gets all the boxscores for the yahoo league over the year provided
 *
 * @param season
 * @param week
 * @returns {Promise<*>}
 */
async function fetchYahooBoxscores({ season, week }) {
  logger.debug(`fetchYahooBoxscores({ season: ${season}, week: ${week} })`);
  return getSet({
    key: `fetchYahooBoxscores.${season}.${week}`,
    ttl: 60 * 60,
    loader: async () =>
      fetchBoxscores({ client: getYahooLeagueClient(), season, week }),
  });
}

module.exports = {
  fetchEspnBoxscores,
  fetchYahooBoxscores,
};
