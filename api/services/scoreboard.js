const { getBoxscoresAtSeasonWeek } = require('./boxscores');
const { getRecords } = require('./records');

function addRecordsToBoxscores({ records, boxscore }) {
  return {
    homeScore: {
      points: boxscore.home.points,
      teamRecord: records[boxscore.home.team.owner.id],
    },
    awayScore: {
      points: boxscore.away.points,
      teamRecord: records[boxscore.away.team.owner.id],
    },
  };
}

function calculateScoreboard({ records, boxscores }) {
  return boxscores.map(boxscore =>
    addRecordsToBoxscores({ records, boxscore }),
  );
}

async function getScoreboard({ year, week }) {
  let calculatedWeek = week;
  if (week === 0) {
    calculatedWeek = 13;
  }

  const records = await getRecords({ season: year, week });
  const boxscores = await getBoxscoresAtSeasonWeek({
    season: year,
    week: calculatedWeek,
  });

  return calculateScoreboard({ records, boxscores });
}

module.exports = {
  getScoreboard,
};
