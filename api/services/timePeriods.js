const { range } = require('../utils/polyfills');

const SEPTEMBER = 8;
const FIRST_DAY_OF_WEEK = 2;
const LAST_WEEK_OF_SEASON = 13;
const LAST_WEEK_OF_POST_SEASON = 16;
const FIRST_SEASON = 2018;

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

function startOfSeason(year) {
  if (year === 2020) {
    // 2020 started a week later, stupid COVID
    return firstTuesAfterDate(new Date(year, SEPTEMBER, 7));
  }

  return firstTuesAfterDate(new Date(year, SEPTEMBER, 1));
}

function getHighestWeek() {
  const diff = new Date() - startOfSeason(getCurrentSeason());
  const weekDiff = Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));

  if (weekDiff > LAST_WEEK_OF_SEASON) {
    return LAST_WEEK_OF_SEASON;
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
  const diff = new Date() - startOfSeason(getCurrentSeason());
  const weekDiff = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));

  if (weekDiff > LAST_WEEK_OF_POST_SEASON) {
    return LAST_WEEK_OF_POST_SEASON;
  }

  if (weekDiff < LAST_WEEK_OF_SEASON + 1) {
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
        ? range(1, LAST_WEEK_OF_SEASON + 1)
        : range(1, getHighestWeek() + 1),
    postSeasonWeeks:
      season !== currentSeason
        ? range(14, LAST_WEEK_OF_POST_SEASON + 1)
        : range(14, getCurrentPostSeasonWeek() + 1),
  }));
}

module.exports = {
  getCurrentWeek,
  getCurrentSeason,
  getSeasons,
};
