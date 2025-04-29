const fs = require('node:fs/promises')
const hubspot = require('@hubspot/api-client');
const phoneProperties = require('./phone-properties.js')
const allProperties = require('./all-properties.js');
const { access } = require('node:fs');

require('dotenv').config()

global.log = (obj) => console.dir(obj, { depth: null, colors: true });

const hubspotClient = new hubspot.Client({accessToken: process.env.ACCESS_TOKEN});


(async () => {
  try {


  } catch (err) {
    console.error(`An error within the main process: ${err}`)
  }
})();

async function getSignedUrlForPrivateFile(fileId) {
  
  const size = undefined
  const expirationSeconds = undefined
  const upscale = undefined

  try {

    const response = await hubspotClient.files.filesApi.getSignedUrl(
      fileId, 
      size, 
      expirationSeconds, 
      upscale
    )
    return response.url

  } catch (err) {
    console.error(err)
  }
}

async function downloadFile(url, path) {

  try {

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
      }
    })

    if (!response.ok) {
      log(response)
      throw new Error(`Download failed: ${response.status} ${response.statusText}`)
    } 

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await fs.writeFile(path, buffer)
    return path

  } catch (err) {
    console.error(err)
  }
}

// Iterate a paged function, save the data 

async function getAllPagesOfObjects (fetchFunction) {
  const allData = []
  let after;

  do {

    const response = await fetchFunction(after)
    const { results } = response
    allData.push(...results)
   
    after = response.paging?.next?.after
    if (after) {
      console.log(`After: ${after}`)
      await sleep(200)
    } 

  } while (after)

  // Define the path where the contacts will be saved
  const functionName = fetchFunction.name
  const path = generatePath(functionName)
  console.log(`Path: ${path}`)

  // Save contacts as JSON to the file
  await writeJsonFile (path, allData)
  
  // Read and return result
  const savedData = await readJsonFile(path)
  log(`Total objects saved by ${functionName}: ${savedData.length}`)
  return savedData
}

// API functions

async function searchFiles(after) {
  
  const properties = undefined;
  // const after = undefined;
  const before = undefined;
  const limit = 100;
  const sort = undefined;
  const ids = undefined;
  const idLte = undefined;
  const idGte = undefined;
  const createdAt = undefined;
  const createdAtLte = undefined;
  const createdAtGte = undefined;
  const updatedAt = undefined;
  const updatedAtLte = undefined;
  const updatedAtGte = undefined;
  const name = undefined;
  const path = undefined;
  const parentFolderIds = undefined;
  const size = undefined;
  const sizeLte = undefined;
  const sizeGte = undefined;
  const height = undefined;
  const heightLte = undefined;
  const heightGte = undefined;
  const width = undefined;
  const widthLte = undefined;
  const widthGte = undefined;
  const encoding = undefined;
  const type = undefined;
  const extension = undefined;
  const url = undefined;
  const isUsableInContent = undefined;
  const allowsAnonymousAccess = undefined;
  const fileMd5 = undefined;
  const expiresAt = undefined;
  const expiresAtLte = undefined;
  const expiresAtGte = undefined;

try {
  return await hubspotClient.files.filesApi.doSearch(properties, after, before, limit, sort, ids, idLte, idGte, createdAt, createdAtLte, createdAtGte, updatedAt, updatedAtLte, updatedAtGte, name, path, parentFolderIds, size, sizeLte, sizeGte, height, heightLte, heightGte, width, widthLte, widthGte, encoding, type, extension, url, isUsableInContent, allowsAnonymousAccess, fileMd5, expiresAt, expiresAtLte, expiresAtGte);
} catch (e) {
  e.message === 'HTTP request failed'
    ? console.error(JSON.stringify(e.response, null, 2))
    : console.error(e)
}

}

async function batchReadAssociations() {
  try {
    const fromObjType = 'note'
    const toObjType = 'contact'
    return await hubspotClient.crm.associations.v4.batchApi.getPage(fromObjType, toObjType)
  } catch (err) {
    console.error(err)
  }
}

async function searchNotes() {

  const searchParams = {
    sorts: [{ propertyName: 'createdate', direction: 'DESCENDING' }],
    properties:['hs_timestamp', 'hs_note_body', 'hubspot_owner_id', 'hs_attachment_ids'],
    filters: [{
      "propertyName": "associations.contact",
      "operator": "EQ",
      "value": "123147158454490"
    }],
    // after: 0,
    limit: 2
  }

  try {
    const response = await hubspotClient.crm.objects.notes.searchApi.doSearch(searchParams)
    return response
  } catch (err) {
    console.error(err)
  }
}

async function getNotes(after) {
  const limit = 100
  // const after = undefined
  const properties = ['hs_timestamp', 'hs_note_body', 'hubspot_owner_id', 'hs_attachment_ids']
  const propertiesWithHistory = undefined
  const associations = undefined
  const archived = false

  try {
    const response = await hubspotClient.crm.objects.notes.basicApi.getPage(
      limit, 
      after, 
      properties, 
      propertiesWithHistory, 
      associations, 
      archived
    )
    return response
  }
  catch (err) {
    console.error(err)
  }
}

async function getContacts(after) {
  const limit = 100
  const properties = allProperties
  const propertiesWithHistory = undefined
  const associations = ['notes', 'companies']
  const archived = false
  try {
    return await hubspotClient.crm.contacts.basicApi.getPage(
      limit, 
      after, 
      properties, 
      propertiesWithHistory, 
      associations, 
      archived
    )
  } catch (err) {
    console.error(err)
  }
}

async function searchContacts (after) {
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
      limit: 100,
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

function generatePath (functionName) {
  const timestamp = makeTimestamp()
  return `${functionName}-${timestamp}.json`
}