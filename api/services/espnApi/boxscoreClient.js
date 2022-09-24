const { getEspnLeagueClient, getYahooLeagueClient } = require('./espnClient');
const { getSet } = require('../../utils/cache');
const { logger } = require('../../utils/logger');

function constructTeamScore(teamScore, leagueName) {
  let pointsLive = 0;
  if (teamScore.totalPointsLive) {
    pointsLive = +teamScore.totalPointsLive.toFixed(1);
  }

  return {
    teamId: `${leagueName}:${teamScore.teamId}`,
    points: +teamScore.totalPoints.toFixed(1),
    pointsLive,
  };
}

function constructBoxscore(boxscore, leagueName) {
  return {
    home: constructTeamScore(boxscore.home, leagueName),
    away: 'away' in boxscore ? constructTeamScore(boxscore.away, leagueName) : null,
  };
}

function constructBoxscores(schedule, leagueName) {
  return schedule.reduce((boxscores, score) => {
    const scores =
      score.matchupPeriodId in boxscores
        ? boxscores[score.matchupPeriodId]
        : [];
    scores.push(constructBoxscore(score, leagueName));

    const clonedBoxscores = { ...boxscores };
    clonedBoxscores[score.matchupPeriodId] = scores;

    return clonedBoxscores;
  }, {});
}

function parseResponse(response, leagueName) {
  return {
    boxscores: constructBoxscores(response.schedule, leagueName),
  };
}

async function fetchBoxscores({ leagueName, season, week }) {
  const client = leagueName == 'ESPN' ? getEspnLeagueClient() : getYahooLeagueClient();

  const response = await client
    .getBoxscoresAtWeek({ season, week })
    .catch(logger.error);

  return parseResponse(await response.json(), leagueName).boxscores;
}

// Both of the below function return data in the format:
// {
//   1: [
//     {
//       home: {
//         teamId: 4,
//         points: 101.7
//       },
//       away: { // Away is optional since bye weeks won't include away teams
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
  return getSet({
    key: `fetchEspnBoxscores.${season}.${week}`,
    ttl: 60 * 5,
    loader: async () =>
      fetchBoxscores({ leagueName: "ESPN", season, week }),
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
  return getSet({
    key: `fetchYahooBoxscores.${season}.${week}`,
    ttl: 60 * 5,
    loader: async () =>
      fetchBoxscores({ leagueName: "YAHOO", season, week }),
  });
}

module.exports = {
  fetchEspnBoxscores,
  fetchYahooBoxscores,
};
