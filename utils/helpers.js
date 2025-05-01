
// This file contains helper functions for the application

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function makeTimestamp () {
  const now = new Date()
  return now.toISOString()
  .replace('T', '_')     // Replace T with an underscore
  .replace(/:/g, '-')    // Replace colons with dashes
  .replace(/\..+/, '')  // Remove milliseconds and the trailing 'Z'
}

module.exports = {
  sleep,
  makeTimestamp
}