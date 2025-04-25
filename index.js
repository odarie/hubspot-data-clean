const hubspot = require('@hubspot/api-client')

require('dotenv').config()
global.log = (obj) => console.dir(obj, { depth: null, colors: true });

const hubspotClient = new hubspot.Client({accessToken: process.env.ACCESS_TOKEN})

const publicObjectSearchRequest = {
  sorts: [{ propertyName: 'createdate', direction: 'DESCENDING' }],
  properties: ['createdate', 'firstname', 'lastname'],
  limit: 1,
  after: 0,
}

async function searchApi () {
  const response = await hubspotClient.crm.contacts.searchApi.doSearch(publicObjectSearchRequest)
  log(response)
}

searchApi()
