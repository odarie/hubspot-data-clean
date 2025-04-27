const fs = require('node:fs/promises')
const hubspot = require('@hubspot/api-client');
const phoneProperties = require('./phone-properties.js')
const allProperties = require('./all-properties.js')

require('dotenv').config()

global.log = (obj) => console.dir(obj, { depth: null, colors: true });

const hubspotClient = new hubspot.Client({accessToken: process.env.ACCESS_TOKEN});


(async () => {
  try {
    // Retrieve all contacts from HubSpot API
    const allContacts = await getAllContacts();
    // Define the path where the contacts will be saved
    const timestamp = makeTimestamp()
    const path = `all-contacts-${timestamp}.json`
    // Save contacts as JSON to the file
    await writeJsonFile (path, allContacts)
      // Read back the contacts from the file
    const allContactsFromFile = await readJsonFile(path)
    
    log(`Total: ${allContactsFromFile.length}`)
    log(allContactsFromFile[0])
    
  } catch (err) {
    console.log(`An error within the main process: ${err}`)
  }
})();

// API functions

async function getAllContacts () {
  const allContacts = []
  let after;

  do {

    const response = await searchContacts(100, after)
    const { results, total} = response
    allContacts.push(...results)
   
    after = response.paging?.next?.after
    if (after) {
      await sleep(200)
    } 

  } while (after)
  return allContacts
}

async function searchContacts (limit, after) {
  try {
    // Filter and return phone phoneProperties only
    const searchParams = {
      sorts: [{ propertyName: 'createdate', direction: 'DESCENDING' }],
      properties: allProperties,
      filterGroups: [{
        filters: [
          {
            propertyName: 'firstname',
            operator: 'EQ',
            value: process.env.NAME_VALUE
          }
        ]
      }],
      limit: limit,
      after: after,
    }
    const response = await hubspotClient.crm.contacts.searchApi.doSearch(searchParams)
    // const { results, total, paging: { next: { after } } } = response  
    return response
  } catch (err) {
    console.error(`Failed to search contacts: ${err}`)
  }
}

async function getContactById (id) {
  try {
    const response = await hubspotClient.crm.contacts.basicApi.getById(id, phoneProperties)
    log(response)
  } catch (err) {
    console.error(`Failed to get contact by id: ${err}`)
  }
}

// File utilities

async function writeJsonFile(path, data) {
  const jsonString = JSON.stringify(data, null, 2)
  await fs.writeFile(path, jsonString)
}

async function readJsonFile(path) {
  const data = await fs.readFile(path, 'utf8')
  return JSON.parse(data)
}

// Data processing

function createFilterGroups (propertyArray) {
  // Generate "OR" filter groups for each property
  return propertyArray.map(field => ({
    filters: [
      {
        propertyName: field,
        operator: 'HAS_PROPERTY',
      }
    ]
  }));
}

function extractPhoneNumbers(objArr) {
  // Leave only phone numbers and the corresponding id for each contact
    const numberObjArr = objArr.map( e => {

      const { id } = e
      const { phone, mobilephone, third_phone_number, fourth_phone_number } = e.phoneProperties

      const numbers = { phone, mobilephone, third_phone_number, fourth_phone_number }

      const extractedNumbers = Object.fromEntries(
        Object.entries(numbers).filter(([_, value]) => value !== null)
      );
      log(extractedNumbers)
      const cleanedContact = {
        id: id,
        phonenumbers: extractedNumbers
      }
      return cleanedContact
   })
   return numberObjArr
}

// Helper functions

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function makeTimestamp () {
  const now = new Date();
  return now.toISOString()
  .replace('T', '_')     // Replace T with an underscore
  .replace(/:/g, '-')    // Replace colons with dashes
  .replace(/\..+/, '');  // Remove milliseconds and the trailing 'Z'
}
