const { logger } = require('../utils/logger');
const { getObjectValues } = require('../utils/polyfills');
const { getRecords } = require('./records');

// Checks if the ranking team has a worse record than the reference
function isRecordWorse(rankingTeam, referenceTeam) {
  return (
    rankingTeam.record.wins < referenceTeam.record.wins ||
    (rankingTeam.record.wins === referenceTeam.record.wins &&
      rankingTeam.record.ties < referenceTeam.record.ties) ||
    (rankingTeam.record.wins === referenceTeam.record.wins &&
      rankingTeam.record.ties === referenceTeam.record.ties &&
      rankingTeam.pointsFor < referenceTeam.pointsFor)
  );
}

function orderTeamsByRank(teams) {
  const orderedTeams = getObjectValues(teams);
  const teamCount = orderedTeams.length;

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < teamCount - 1; i++) {
    // eslint-disable-next-line no-plusplus
    for (let j = 0; j < teamCount - i - 1; j++) {
      if (isRecordWorse(orderedTeams[j], orderedTeams[j + 1])) {
        const teamToMove = orderedTeams[j];
        orderedTeams[j] = orderedTeams[j + 1];
        orderedTeams[j + 1] = teamToMove;
      }
    }
  }

  // eslint-disable-next-line no-plusplus
  for (let k = 0; k < teamCount; k++) {
    orderedTeams[k].rank = k + 1;
  }

  return orderedTeams;
}

async function calculateStandings({ season, week }) {
  logger.debug(`calculateStandings({ season: ${season}, week: ${week} })`);
  return orderTeamsByRank(await getRecords({ season, week }));
}

async function standingsBySeasonWeek({ year, week }) {
  // If the standings are cached load them up and return
  // const cacheKey = `standingsBySeasonWeek.${year}.${week}`;
  // const areStandingsCached = await cache.existsAsync(cacheKey);
  // if (areStandingsCached) {
  //   return cache.getAync(cacheKey);
  // }
  // return [
  //   {
  //     rank: 0,
  //     team: {
  //       name: 'Ajayi Swept The Division',
  //       owner: { name: 'Maclane Walsh' },
  //     },
  //     record: { wins: 6, losses: 1, ties: 0 },
  //     pointsFor: 958.22,
  //     pointsAgainst: 758.48,
  //   },
  //   {
  //     rank: 2,
  //     team: { name: 'Trash  Cans', owner: { name: 'Adam Ciampi' } },
  //     record: { wins: 6, losses: 1, ties: 0 },
  //     pointsFor: 944.58,
  //     pointsAgainst: 793.66,
  //   },
  //   {
  //     rank: 3,
  //     team: { name: 'Flopper Gunner', owner: { name: 'Pat Semeter' } },
  //     record: { wins: 6, losses: 1, ties: 0 },
  //     pointsFor: 823.04,
  //     pointsAgainst: 700.44,
  //   },
  //   {
  //     rank: 4,
  //     team: { name: "Frank's  Dead", owner: { name: 'Ryan Sullivan' } },
  //     record: { wins: 5, losses: 2, ties: 0 },
  //     pointsFor: 856.3,
  //     pointsAgainst: 776.6,
  //   },
  //   {
  //     rank: 5,
  //     team: { name: 'Jennys Boyfriend', owner: { name: 'Devin Garvey' } },
  //     record: { wins: 5, losses: 2, ties: 0 },
  //     pointsFor: 842.2,
  //     pointsAgainst: 678.7,
  //   },
  //   {
  //     rank: 6,
  //     team: { name: 'Team Barnas', owner: { name: 'Joe Barnas' } },
  //     record: { wins: 4, losses: 3, ties: 0 },
  //     pointsFor: 847.7,
  //     pointsAgainst: 731.88,
  //   },
  //   {
  //     rank: 7,
  //     team: {
  //       name: 'Dont ever start Josh Reynolds',
  //       owner: { name: 'Shrinjoy Sahoo' },
  //     },
  //     record: { wins: 4, losses: 3, ties: 0 },
  //     pointsFor: 765.94,
  //     pointsAgainst: 777.62,
  //   },
  //   {
  //     rank: 8,
  //     team: { name: 'The Yahoo Killer', owner: { name: 'Mark Daley' } },
  //     record: { wins: 4, losses: 3, ties: 0 },
  //     pointsFor: 747.04,
  //     pointsAgainst: 706.68,
  //   },
  //   {
  //     rank: 9,
  //     team: { name: 'DDT 2K18', owner: { name: 'Robby Loftus' } },
  //     record: { wins: 4, losses: 3, ties: 0 },
  //     pointsFor: 732.34,
  //     pointsAgainst: 702.16,
  //   },
  //   {
  //     rank: 10,
  //     team: {
  //       name: 'Ajayi Feel Like a Woman',
  //       owner: { name: 'Sean Mitsock' },
  //     },
  //     record: { wins: 4, losses: 3, ties: 0 },
  //     pointsFor: 713.84,
  //     pointsAgainst: 738.18,
  //   },
  //   {
  //     rank: 11,
  //     team: {
  //       name: 'Thad Castle for President',
  //       owner: { name: 'Alek Pouliopoulos' },
  //     },
  //     record: { wins: 4, losses: 3, ties: 0 },
  //     pointsFor: 663.52,
  //     pointsAgainst: 711.6,
  //   },
  //   {
  //     rank: 12,
  //     team: { name: 'Clown ina Gown', owner: { name: 'Scott Herald' } },
  //     record: { wins: 3, losses: 4, ties: 0 },
  //     pointsFor: 824.86,
  //     pointsAgainst: 886.64,
  //   },
  //   {
  //     rank: 13,
  //     team: { name: 'Absolute Units', owner: { name: 'Mike Miceli' } },
  //     record: { wins: 3, losses: 4, ties: 0 },
  //     pointsFor: 785.72,
  //     pointsAgainst: 801.78,
  //   },
  //   {
  //     rank: 14,
  //     team: { name: '2 Squids 1 Dress', owner: { name: 'Derek Lavigne' } },
  //     record: { wins: 3, losses: 4, ties: 0 },
  //     pointsFor: 695.94,
  //     pointsAgainst: 675.88,
  //   },
  //   {
  //     rank: 15,
  //     team: {
  //       name: 'Running Back by Committee',
  //       owner: { name: 'Donny Barnas' },
  //     },
  //     record: { wins: 2, losses: 5, ties: 0 },
  //     pointsFor: 772.26,
  //     pointsAgainst: 811.94,
  //   },
  //   {
  //     rank: 16,
  //     team: { name: 'Team Biscuit', owner: { name: 'Tommy Grip' } },
  //     record: { wins: 2, losses: 5, ties: 0 },
  //     pointsFor: 733.22,
  //     pointsAgainst: 852.9,
  //   },
  //   {
  //     rank: 17,
  //     team: {
  //       name: 'All Hail the Vi Kings',
  //       owner: { name: 'Brian Rosinski' },
  //     },
  //     record: { wins: 2, losses: 5, ties: 0 },
  //     pointsFor: 650.38,
  //     pointsAgainst: 823.44,
  //   },
  //   {
  //     rank: 18,
  //     team: { name: 'Ajayi Feel Pretty', owner: { name: 'Ryan Hurley' } },
  //     record: { wins: 1, losses: 6, ties: 0 },
  //     pointsFor: 696.72,
  //     pointsAgainst: 785.2,
  //   },
  //   {
  //     rank: 19,
  //     team: { name: 'Team Chief Pits ', owner: { name: 'Dan Lawson' } },
  //     record: { wins: 1, losses: 6, ties: 0 },
  //     pointsFor: 638.74,
  //     pointsAgainst: 757.1,
  //   },
  //   {
  //     rank: 20,
  //     team: { name: 'Team Wasko', owner: { name: 'Andrew Wasko' } },
  //     record: { wins: 1, losses: 6, ties: 0 },
  //     pointsFor: 620.76,
  //     pointsAgainst: 842.44,
  //   },
  // ];

  // eslint-disable-next-line no-unreachable
  logger.debug(`standingsBySeasonWeek({ year: ${year}, week: ${week} })`);
  return calculateStandings({ season: year, week });

  // cache.set('test', 56);
}

module.exports = { standingsBySeasonWeek };
