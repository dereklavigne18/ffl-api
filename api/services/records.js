const { logger } = require('../utils/logger');
const { range } = require('../utils/polyfills');
const { getAllBoxscores } = require('./boxscores');

const LAST_WEEK_OF_REGULAR_SEASON = 13;

function initializeTeamRecord({ teamRecords, team }) {
  const clonedTeamRecords = { ...teamRecords };
  clonedTeamRecords[team.owner.id] = {
    team,
    pointsAgainst: 0,
    pointsFor: 0,
    rank: 0,
    record: {
      wins: 0,
      losses: 0,
      ties: 0,
    },
  };

  return clonedTeamRecords;
}

function initializeTeamRecords({ boxscores }) {
  return boxscores.reduce((teamRecords, boxscore) => {
    const teamRecordsWithHomeTeam = initializeTeamRecord({
      teamRecords,
      team: boxscore.home.team,
    });

    return initializeTeamRecord({
      teamRecords: teamRecordsWithHomeTeam,
      team: boxscore.away.team,
    });
  }, {});
}

function calculateUpdatedTeamRecord({
  teamRecord,
  teamBoxscore,
  opponentBoxscore,
}) {
  return {
    ...teamRecord,
    pointsAgainst: +(
      teamRecord.pointsAgainst + opponentBoxscore.points
    ).toFixed(2),
    pointsFor: +(teamRecord.pointsFor + teamBoxscore.points).toFixed(2),
    record: {
      wins:
        teamBoxscore.points > opponentBoxscore.points
          ? teamRecord.record.wins + 1
          : teamRecord.record.wins,
      losses:
        teamBoxscore.points < opponentBoxscore.points
          ? teamRecord.record.losses + 1
          : teamRecord.record.losses,
      ties:
        teamBoxscore.points === opponentBoxscore.points
          ? teamRecord.record.ties + 1
          : teamRecord.record.ties,
    },
  };
}

function addGameResultToTeamRecords({ teamRecords, boxscore }) {
  const clonedTeamRecords = { ...teamRecords };
  const homeTeamRecord = clonedTeamRecords[boxscore.home.team.owner.id];
  const awayTeamRecord = clonedTeamRecords[boxscore.away.team.owner.id];

  clonedTeamRecords[boxscore.home.team.owner.id] = calculateUpdatedTeamRecord({
    teamRecord: homeTeamRecord,
    teamBoxscore: boxscore.home,
    opponentBoxscore: boxscore.away,
  });
  clonedTeamRecords[boxscore.away.team.owner.id] = calculateUpdatedTeamRecord({
    teamRecord: awayTeamRecord,
    teamBoxscore: boxscore.away,
    opponentBoxscore: boxscore.home,
  });

  return clonedTeamRecords;
}

function addWeekResultsToTeamRecords({ teamRecords, boxscores }) {
  return boxscores.reduce(
    (clonedTeamRecords, boxscore) =>
      addGameResultToTeamRecords({
        teamRecords: clonedTeamRecords,
        boxscore,
      }),
    teamRecords,
  );
}

function calculateTeamRecords({ boxscores, week }) {
  let lastWeekToCount = week;
  if (week > LAST_WEEK_OF_REGULAR_SEASON) {
    lastWeekToCount = LAST_WEEK_OF_REGULAR_SEASON + 1;
  }

  return range(1, lastWeekToCount).reduce(
    (teamRecords, currentWeek) =>
      addWeekResultsToTeamRecords({
        teamRecords,
        boxscores: boxscores[currentWeek],
      }),
    initializeTeamRecords({ boxscores: boxscores[1] }),
  );
}

async function getRecords({ season, week }) {
  logger.debug(`getRecords({ season: ${season}, week: ${week} })`);

  let calculatedWeek = week;
  if (week === 0) {
    calculatedWeek = 14;
  }

  const boxscores = await getAllBoxscores({ season, week });
  return calculateTeamRecords({ boxscores, week: calculatedWeek });
}

module.exports = {
  getRecords,
};
