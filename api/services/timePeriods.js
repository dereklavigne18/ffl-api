const { range } = require('../utils/polyfills');

const SEPTEMBER = 8;
const FIRST_DAY_OF_WEEK = 2;
const FIRST_SEASON = 2018;
const NUM_POST_SEASON_WEEKS = 3;

function dayAfter(date) {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  return nextDay;
}

function firstTuesAfterDate(date) {
  let daysCheckedCount = 0;
  const dateToCheck = date;

  while (daysCheckedCount < 8) {
    if (dateToCheck.getDay() === FIRST_DAY_OF_WEEK) {
      return dateToCheck;
    }

    dateToCheck.setDate(dayAfter(date).getDate());
    daysCheckedCount += 1;
  }

  throw new Error('Could not find start of season.');
}

function getWeeksForSeason(season) {
  // In 2020, the NFL added an extra week
  return season > 2019 ? range(1, 15) : range(1, 14);
}

function getWeeksForPostSeason(season) {
  const firstPostSeasonWeek = getFirstWeekOfPostSeason(season);

  return range(firstPostSeasonWeek, firstPostSeasonWeek + NUM_POST_SEASON_WEEKS);
}

function getLastWeekOfSeason(season) {
  return getWeeksForSeason(season).pop();
}

function getFirstWeekOfPostSeason(season) {
  return getLastWeekOfSeason(season) + 1;
}

function startOfSeason(year) {
  if (year === 2020) {
    // 2020 started a week later, stupid COVID
    return firstTuesAfterDate(new Date(year, SEPTEMBER, 7));
  }

  return firstTuesAfterDate(new Date(year, SEPTEMBER, 1));
}

function getHighestWeek() {
  const season = getCurrentSeason();
  const lastWeekOfSeason = getLastWeekOfSeason(season);
  const diff = new Date() - startOfSeason(season);
  const weekDiff = Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));

  if (weekDiff > lastWeekOfSeason) {
    return lastWeekOfSeason;
  }
  if (weekDiff < 1) {
    return 1;
  }

  return weekDiff;
}

function getCurrentWeek() {
  if (getCurrentPostSeasonWeek() !== 0) {
    return 0;
  }

  return getHighestWeek();
}

function getCurrentPostSeasonWeek() {
  const season = getCurrentSeason();
  const lastWeekOfSeason = getLastWeekOfSeason(season);
  const diff = new Date() - startOfSeason(season);
  const weekDiff = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));

  if (weekDiff > lastWeekOfSeason) {
    return lastWeekOfSeason;
  }

  if (weekDiff < lastWeekOfSeason + 1) {
    return 0;
  }

  return weekDiff;
}

function getCurrentSeason() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const seasonStartDate = startOfSeason(currentYear);

  return now < seasonStartDate ? currentYear - 1 : currentYear;
}

function getSeasons() {
  const currentSeason = getCurrentSeason();
  return range(FIRST_SEASON, currentSeason + 1).map(season => ({
    year: season,
    weeks:
      season !== currentSeason
        ? getWeeksForSeason(season)
        : range(1, getHighestWeek() + 1),
    postSeasonWeeks:
      season !== currentSeason
        ? getWeeksForPostSeason(season)
        : range(getFirstWeekOfPostSeason(season), getCurrentPostSeasonWeek() + 1),
  }));
}

module.exports = {
  getLastWeekOfSeason,
  getCurrentSeason,
  getCurrentWeek,
  getSeasons,
  getWeeksForSeason,
};
