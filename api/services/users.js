const { getObjectValues } = require('../utils/polyfills');

function getUserById(id) {
  return users[id];
}

function getUserByUsername(username) {
  return getObjectValues(users).find(user => user.username === username);
}

module.exports = {
  getUserById,
  getUserByUsername,
};

const users = {
  '{145C8AEE-28CD-45FC-80A9-D26621D79BA6}': {
    id: '{145C8AEE-28CD-45FC-80A9-D26621D79BA6}',
    username: 'rloftus233',
    name: 'Robby Loftus',
  },
  '{3B49E16A-C801-4A35-AA4D-91D3ECB4400E}': {
    id: '{3B49E16A-C801-4A35-AA4D-91D3ECB4400E}',
    username: 'A_Champs',
    name: 'Adam Ciampi',
  },
  '{3CA22917-EFB2-416B-B684-2FBBEBF65E58}': {
    id: '{3CA22917-EFB2-416B-B684-2FBBEBF65E58}',
    username: 'sikskillz18',
    name: 'Ryan Sullivan',
  },
  '{4A206B16-0411-48D3-8C67-A286EC5533D5}': {
    id: '{4A206B16-0411-48D3-8C67-A286EC5533D5}',
    username: 'm83walsh',
    name: 'Maclane Walsh',
  },
  '{715B9EB1-1F6C-4FC0-8389-45593ACBA742}': {
    id: '{715B9EB1-1F6C-4FC0-8389-45593ACBA742}',
    username: 'hurleyr22',
    name: 'Ryan Hurley',
  },
  '{71CEAABF-77D5-4852-8E90-CD86FEF68555}': {
    id: '{71CEAABF-77D5-4852-8E90-CD86FEF68555}',
    username: 'seanm1414',
    name: 'Sean Mitsock',
  },
  '{7D601BE5-F0D4-4D4B-96B1-9BD39E924666}': {
    id: '{7D601BE5-F0D4-4D4B-96B1-9BD39E924666}',
    username: 'mikemiceli28',
    name: 'Tom Miceli',
  },
  '{B1E4E349-29C9-4B7E-BDA8-97F1AE59D81D}': {
    id: '{B1E4E349-29C9-4B7E-BDA8-97F1AE59D81D}',
    username: 'scooter8585',
    name: 'Scott Herald',
  },
  '{D06F86E2-F304-45DD-9809-36939E503AD2}': {
    id: '{D06F86E2-F304-45DD-9809-36939E503AD2}',
    username: 'patsemeter',
    name: 'Pat Semeter',
  },
  '{D9682087-E955-4397-B7C5-1CA5D75B407B}': {
    id: '{D9682087-E955-4397-B7C5-1CA5D75B407B}',
    username: 'awask17',
    name: 'Andrew Wasko',
  },
  '{EB82DFDF-CE30-49E0-9492-993425B85718}': {
    id: '{EB82DFDF-CE30-49E0-9492-993425B85718}',
    username: 'dlavig5776241',
    name: 'Derek Lavigne',
  },
  '{159AF644-2AC3-4F5B-ADE8-4BB5F5E3AB79}': {
    id: '{159AF644-2AC3-4F5B-ADE8-4BB5F5E3AB79}',
    username: 'Dan Lawson17',
    name: 'Dan Lawson',
  },
  '{1F69DF07-6AF9-417B-8570-9FCA055560D5}': {
    id: '{1F69DF07-6AF9-417B-8570-9FCA055560D5}',
    username: 'bigjkeggar',
    name: 'Joe Barnas',
  },
  '{2DDF67A5-972E-476B-BFBE-E36B07580092}': {
    id: '{2DDF67A5-972E-476B-BFBE-E36B07580092}',
    username: 'barosinski',
    name: 'Brian Rosinski',
  },
  '{399439EF-7D6F-45CD-A030-5101CA775FD5}': {
    id: '{399439EF-7D6F-45CD-A030-5101CA775FD5}',
    username: 'garvey789',
    name: 'Devin Garvey',
  },
  '{44874A58-E800-422B-B388-3DC3CBB0B608}': {
    id: '{44874A58-E800-422B-B388-3DC3CBB0B608}',
    username: 'shrins3',
    name: 'Shrinjoy Sahoo',
  },
  '{5A5BCEF5-02A7-42A0-8E78-E3D4C1DAF951}': {
    id: '{5A5BCEF5-02A7-42A0-8E78-E3D4C1DAF951}',
    username: 'GripTommy',
    name: 'Tommy Grip',
  },
  '{5FE61F05-2BD8-4952-80FA-9BFD2AECEF75}': {
    id: '{5FE61F05-2BD8-4952-80FA-9BFD2AECEF75}',
    username: 'mdaley6931068',
    name: 'Mark Daley',
  },
  '{7116CDEF-1EB6-45F0-A33F-B556F0738408}': {
    id: '{7116CDEF-1EB6-45F0-A33F-B556F0738408}',
    username: 'alekpo3067066',
    name: 'Alek Pouliopoulos',
  },
  '{7D52FE81-6F0A-44B2-91B4-E8B39B198A5A}': {
    id: '{7D52FE81-6F0A-44B2-91B4-E8B39B198A5A}',
    username: 'Dfb337',
    name: 'Donny Barnas',
  },
  '{85C495C7-882F-4F3F-A3C5-3D21C8E45F86}': {
    id: '{85C495C7-882F-4F3F-A3C5-3D21C8E45F86}',
    username: 'Apouli',
    name: 'Alek Pouliopoulos',
  },
  '{9D99F353-907A-43E0-BBF9-3168C5F7CC68}': {
    id: '{9D99F353-907A-43E0-BBF9-3168C5F7CC68}',
    username: 'cmckenna316',
    name: 'Colin Mckenna',
  },
  '{C1B33940-6DA2-47CC-9F93-D1911905B52A}': {
    id: '{C1B33940-6DA2-47CC-9F93-D1911905B52A}',
    username: 'ESPNfan7484971753',
    name: 'Ed Loftus',
  },
  '{160B1238-CE90-41BD-B095-8FEBBEF97828}': {
    id: '{160B1238-CE90-41BD-B095-8FEBBEF97828}',
    username: 'rgrip95',
    name: 'Robert Grip',
  },
  '{55B882B9-2C00-41B7-99A7-06A934BEA170}': {
    id: '{55B882B9-2C00-41B7-99A7-06A934BEA170}',
    username: 'C0bblestone',
    name: 'Ryan Cobb',
  },
};
