const { logger } = require('../utils/logger');
const { range } = require('../utils/polyfills');

const {
  fetchEspnBoxscores,
  fetchYahooBoxscores,
} = require('./espnApi/boxscoreClient');
const { getEspnTeams, getYahooTeams } = require('./teams');
const { getWeeksForSeason } = require('./timePeriods');

function isInterleagueWeek(week, season) {
  return interleagueMatchups[season][week] !== undefined;
}

function addTeamsToBoxscore(boxscore, teams) {
  // Interleague weeks don't have away scores, so we can ignore them here
  let away = null;
  if (boxscore.away) {
    const tmpAway = boxscore.away;
    const awayPoints =
      tmpAway.pointsLive > tmpAway.points ? tmpAway.pointsLive : tmpAway.points;
    away = {
      points: awayPoints,
      team: teams[tmpAway.teamId],
    };
  }

  const tmpHome = boxscore.home;
  const homePoints =
    tmpHome.pointsLive > tmpHome.points ? tmpHome.pointsLive : tmpHome.points;

  return {
    home: {
      points: homePoints,
      team: teams[tmpHome.teamId],
    },
    away,
  };
}

function mergeBoxscoresForWeek({ espnBoxscores, yahooBoxscores }) {
  return espnBoxscores.concat(yahooBoxscores);
}

function findBoxscoreForHomeTeam(boxscores, teamId) {
  return boxscores.find(boxscore => boxscore.home.team.id === teamId).home;
}

function mergeBoxscoresForInterleagueWeek({
  espnBoxscores,
  yahooBoxscores,
  matchups,
}) {
  return matchups.map(matchup => {
    const espnBoxscore = findBoxscoreForHomeTeam(
      espnBoxscores,
      `ESPN:${matchup.espnTeamId}`,
    );
    const yahooBoxscore = findBoxscoreForHomeTeam(
      yahooBoxscores,
      `YAHOO:${matchup.yahooTeamId}`,
    );

    return {
      home: yahooBoxscore,
      away: espnBoxscore,
    };
  });
}

function calculateBoxscoresForWeek({
  espnBoxscores,
  yahooBoxscores,
  espnTeams,
  yahooTeams,
  week,
  season,
}) {
  const espnBoxscoresWithTeams = espnBoxscores.map(boxscore =>
    addTeamsToBoxscore(boxscore, espnTeams),
  );
  const yahooBoxscoresWithTeams = yahooBoxscores.map(boxscore =>
    addTeamsToBoxscore(boxscore, yahooTeams),
  );

  let boxscoreForWeek;
  if (isInterleagueWeek(week, season)) {
    boxscoreForWeek = mergeBoxscoresForInterleagueWeek({
      espnBoxscores: espnBoxscoresWithTeams,
      yahooBoxscores: yahooBoxscoresWithTeams,
      matchups: interleagueMatchups[season][week],
    });
  } else {
    boxscoreForWeek = mergeBoxscoresForWeek({
      espnBoxscores: espnBoxscoresWithTeams,
      yahooBoxscores: yahooBoxscoresWithTeams,
    });
  }

  return boxscoreForWeek;
}

function calculateBoxscores({
  espnBoxscores,
  yahooBoxscores,
  espnTeams,
  yahooTeams,
  season,
}) {
  return getWeeksForSeason(season).reduce((boxscoreMap, week) => {
    const clonedBoxscoreMap = { ...boxscoreMap };
    clonedBoxscoreMap[week] = calculateBoxscoresForWeek({
      espnBoxscores: espnBoxscores[week],
      yahooBoxscores: yahooBoxscores[week],
      espnTeams,
      yahooTeams,
      week,
      season,
    });

    return clonedBoxscoreMap;
  }, {});
}

// Returns data in the format:
// {
//   1: [
//     {
//       home: {
//         team: {
//           id: 1,
//           name: '2 Squids 1 Dress',
//           owner: {
//             id: '{123xyz}',
//             username: 'dlavig1818',
//             fullName: 'Derek Lavigne'
//           }
//         },
//         points: 101.7
//       },
//       away: {
//         team: {
//           id: 6,
//           name: 'Clown in a Gown',
//           owner: {
//             id: '{abc987}',
//             username: 'scotty2hotty',
//             fullName: 'Scott Herald'
//           }
//         },
//         points: 98.3
//       }
//     }
//   ],
//   ...
// }

async function getAllBoxscores({ season, week }) {
  const espnBoxscores = await fetchEspnBoxscores({ season, week });
  const yahooBoxscores = await fetchYahooBoxscores({ season, week });

  const espnTeams = await getEspnTeams({ season, week });
  const yahooTeams = await getYahooTeams({ season, week });

  return calculateBoxscores({
    espnBoxscores,
    yahooBoxscores,
    espnTeams,
    yahooTeams,
    season,
  });
}

async function getBoxscoresAtSeasonWeek({ season, week }) {
  const boxscores = await getAllBoxscores({ season, week });
  let calculatedWeek = 1;
  if (week !== 1) {
    calculatedWeek = week - 1;
  }

  return boxscores[calculatedWeek];
}

module.exports = {
  getAllBoxscores,
  getBoxscoresAtSeasonWeek,
};

const interleagueMatchups = {
  2016: {
    3: [
      {
        yahooTeamId: 1,
        espnTeamId: 9,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 4,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 2,
        espnTeamId: 4,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 9,
        espnTeamId: 3,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 6,
      },
      {
        yahooTeamId: 5,
        espnTeamId: 7,
      },
    ],
    6: [
      {
        yahooTeamId: 1,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 9,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 4,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 4,
      },
      {
        yahooTeamId: 2,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 3,
      },
      {
        yahooTeamId: 9,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 5,
        espnTeamId: 6,
      },
    ],
    9: [
      {
        yahooTeamId: 1,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 4,
      },
      {
        yahooTeamId: 4,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 3,
      },
      {
        yahooTeamId: 2,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 9,
        espnTeamId: 6,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 5,
        espnTeamId: 9,
      },
    ],
    12: [
      {
        yahooTeamId: 1,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 4,
      },
      {
        yahooTeamId: 4,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 3,
      },
      {
        yahooTeamId: 2,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 9,
        espnTeamId: 6,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 5,
        espnTeamId: 9,
      },
    ],
  },
  2017: {
    3: [
      {
        yahooTeamId: 2,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 4,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 5,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 9,
        espnTeamId: 3,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 1,
        espnTeamId: 4,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 6,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 9,
      },
    ],
    6: [
      {
        yahooTeamId: 2,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 4,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 5,
        espnTeamId: 3,
      },
      {
        yahooTeamId: 9,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 4,
      },
      {
        yahooTeamId: 1,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 9,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 6,
      },
    ],
    9: [
      {
        yahooTeamId: 2,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 4,
        espnTeamId: 3,
      },
      {
        yahooTeamId: 5,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 9,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 4,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 6,
      },
      {
        yahooTeamId: 1,
        espnTeamId: 9,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 10,
      },
    ],
    12: [
      {
        yahooTeamId: 2,
        espnTeamId: 3,
      },
      {
        yahooTeamId: 4,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 5,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 9,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 4,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 9,
      },
      {
        yahooTeamId: 1,
        espnTeamId: 6,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 5,
      },
    ],
  },
  2018: {
    3: [
      {
        yahooTeamId: 4,
        espnTeamId: 6,
      },
      {
        yahooTeamId: 5,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 9,
        espnTeamId: 4,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 2,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 9,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 3,
      },
      {
        yahooTeamId: 1,
        espnTeamId: 1,
      },
    ],
    6: [
      {
        yahooTeamId: 4,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 5,
        espnTeamId: 6,
      },
      {
        yahooTeamId: 9,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 4,
      },
      {
        yahooTeamId: 2,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 9,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 1,
        espnTeamId: 3,
      },
    ],
    9: [
      {
        yahooTeamId: 4,
        espnTeamId: 4,
      },
      {
        yahooTeamId: 5,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 9,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 2,
        espnTeamId: 9,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 3,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 6,
      },
      {
        yahooTeamId: 1,
        espnTeamId: 10,
      },
    ],
    12: [
      {
        yahooTeamId: 4,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 5,
        espnTeamId: 4,
      },
      {
        yahooTeamId: 9,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 2,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 9,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 3,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 1,
        espnTeamId: 6,
      },
    ],
  },
  2019: {
    3: [
      {
        yahooTeamId: 5,
        espnTeamId: 9,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 4,
      },
      {
        yahooTeamId: 2,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 11,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 6,
      },
      {
        yahooTeamId: 1,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 4,
        espnTeamId: 3,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 2,
      },
    ],
    6: [
      {
        yahooTeamId: 5,
        espnTeamId: 4,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 9,
      },
      {
        yahooTeamId: 2,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 11,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 1,
        espnTeamId: 6,
      },
      {
        yahooTeamId: 4,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 3,
      },
    ],
    9: [
      {
        yahooTeamId: 5,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 2,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 11,
        espnTeamId: 6,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 3,
      },
      {
        yahooTeamId: 1,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 4,
        espnTeamId: 9,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 4,
      },
    ],
    12: [
      {
        yahooTeamId: 5,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 2,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 11,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 6,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 1,
        espnTeamId: 3,
      },
      {
        yahooTeamId: 4,
        espnTeamId: 4,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 9,
      },
    ],
  },
  2020: {
    3: [
      {
        yahooTeamId: 1,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 9,
      },
      {
        yahooTeamId: 5,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 2,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 4,
        espnTeamId: 6,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 3,
      },
      {
        yahooTeamId: 11,
        espnTeamId: 4,
      },
    ],
    6: [
      {
        yahooTeamId: 1,
        espnTeamId: 9,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 5,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 2,
        espnTeamId: 6,
      },
      {
        yahooTeamId: 4,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 4,
      },
      {
        yahooTeamId: 11,
        espnTeamId: 3,
      },
    ],
    9: [
      {
        yahooTeamId: 1,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 5,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 6,
      },
      {
        yahooTeamId: 2,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 4,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 3,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 4,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 11,
        espnTeamId: 9,
      },
    ],
    12: [
      {
        yahooTeamId: 1,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 5,
        espnTeamId: 6,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 2,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 4,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 4,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 3,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 9,
      },
      {
        yahooTeamId: 11,
        espnTeamId: 5,
      },
    ],
  },
  2021: {
    3: [
      {
        yahooTeamId: 2,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 5,
        espnTeamId: 9,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 3,
      },
      {
        yahooTeamId: 11,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 1,
        espnTeamId: 6,
      },
      {
        yahooTeamId: 4,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 4,
      },
    ],
    6: [
      {
        yahooTeamId: 2,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 9,
      },
      {
        yahooTeamId: 5,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 11,
        espnTeamId: 6,
      },
      {
        yahooTeamId: 1,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 4,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 3,
      },
    ],
    9: [
      {
        yahooTeamId: 2,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 9,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 5,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 6,
      },
      {
        yahooTeamId: 11,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 1,
        espnTeamId: 4,
      },
      {
        yahooTeamId: 4,
        espnTeamId: 3,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 10,
      },
    ],
    12: [
      {
        yahooTeamId: 2,
        espnTeamId: 9,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 5,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 8,
      },
      {
        yahooTeamId: 11,
        espnTeamId: 4,
      },
      {
        yahooTeamId: 1,
        espnTeamId: 3,
      },
      {
        yahooTeamId: 4,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 6,
      },
    ],
    14: [
      {
        yahooTeamId: 2,
        espnTeamId: 5,
      },
      {
        yahooTeamId: 6,
        espnTeamId: 7,
      },
      {
        yahooTeamId: 3,
        espnTeamId: 2,
      },
      {
        yahooTeamId: 5,
        espnTeamId: 1,
      },
      {
        yahooTeamId: 8,
        espnTeamId: 9,
      },
      {
        yahooTeamId: 10,
        espnTeamId: 4,
      },
      {
        yahooTeamId: 11,
        espnTeamId: 3,
      },
      {
        yahooTeamId: 1,
        espnTeamId: 10,
      },
      {
        yahooTeamId: 4,
        espnTeamId: 6,
      },
      {
        yahooTeamId: 7,
        espnTeamId: 8,
      },
    ],
  },
};
