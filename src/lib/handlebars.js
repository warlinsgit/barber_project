const {format} = require('timeago.js');

// automatically updating fuzzy timestamps (e.g. "4 minutes ago" or "about 1 day ago") 

const helpers = {};

helpers.timeago = (timestamp) => {
  return format(timestamp);
};

module.exports = helpers;
