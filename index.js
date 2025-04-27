const fs = require('node:fs/promises')
const hubspot = require('@hubspot/api-client');

require('dotenv').config()
global.log = (obj) => console.dir(obj, { depth: null, colors: true });

const hubspotClient = new hubspot.Client({accessToken: process.env.ACCESS_TOKEN})

const phoneFields = ['phone', 'mobilephone', 'third_phone_number', 'fourth_phone_number'];

// Generate filter groups for each phone number field
// Include contacts, only when one of the phone fields is not empty

const filterGroups = phoneFields.map(field => ({
  filters: [
    {
      propertyName: field,
      operator: 'HAS_PROPERTY',
    }
  ]
}));

// API functions

async function searchContacts () {
  try {
    // Filter and return phone properties only
    const publicObjectSearchRequest = {
      sorts: [{ propertyName: 'createdate', direction: 'DESCENDING' }],
      properties: phoneFields,
      filterGroups,
      limit: 2,
      after: 0,
    }
    const response = await hubspotClient.crm.contacts.searchApi.doSearch(publicObjectSearchRequest)
    const { results, total, paging: { next: { after } } } = response  
  } catch (err) {
    console.error(`Failed to search contacts: ${err}`)
  }
}

async function getContactById (id) {
  try {
    const response = await hubspotClient.crm.contacts.basicApi.getById(id, phoneFields)
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

// Data processing

function extractPhoneNumbers(objArr) {
  // Leave only phone numbers and the corresponding id for each contact
    const numberObjArr = objArr.map( e => {

      const { id } = e
      const { phone, mobilephone, third_phone_number, fourth_phone_number } = e.properties

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
