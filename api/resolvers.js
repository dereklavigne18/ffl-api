const standings = require('./services/standings');
const scoreboard = require('./services/scoreboard');
const {
  getCurrentWeek,
  getCurrentSeason,
  getSeasons,
} = require('./services/timePeriods');

module.exports = {
  Query: {
    currentWeek: getCurrentWeek,
    currentSeason: getCurrentSeason,
    seasons: getSeasons,
    scoreboard: async (obj, args) => scoreboard.getScoreboard({ ...args }),
    standings: async (obj, args) => ({
      seasonWeek: {
        year: args.year,
        week: args.week,
      },
      records: await standings.standingsBySeasonWeek({ ...args }),
    }),
  },
};