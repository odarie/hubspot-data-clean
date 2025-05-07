
// This file contains functions to interact with the HubSpot API.

import dotenv from 'dotenv'
import hubspot from '@hubspot/api-client'
import phoneProperties from '../phone-properties.js'
import allProperties from '../all-properties.js'
import { writeFileFromBuffer } from './file-utilities.js'


dotenv.config()

const hubspotClient = new hubspot.Client({ accessToken: process.env.ACCESS_TOKEN })

async function upsertBatchOfContacts (contacts)  {

  try {

    const response = await hubspotClient.crm.contacts.batchApi.update(contacts)
    if (response && response.results) {
      console.log(`Successfully upserted ${response.results.length} contacts`)
    } else {
      console.error('No results found in the response for the upserted contacts')
    }
    return response

  } catch (err) { 
    console.error(`Failed to upsert batch of contacts: ${err}`)
    return null
  }
}

async function deleteContact (id) {

  try {
    
    hubspotClient.crm.contacts.basicApi.archive(id)
    // Returns undefined if successful
    return true
  
  } catch (err) {
    console.error(`Failed to delete contact ${id}:`, err)
    return false
  }
}

async function getSignedUrlForPrivateFile (fileId) {
  
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
    return response

  } catch (err) {
    console.error(`Failed to get signed URL for fileId: ${fileId}`)
    return null
  }
}

async function downloadFile (url, filePath) {

  try {

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
      }
    })

    if (!response.ok) {
      throw new Error(`Download failed for path ${filePath}: ${response.status} ${response.statusText}`)
    }

    await writeFileFromBuffer(response, filePath)
    
  } catch (err) {
    console.error(`Failed to download file at path ${filePath}: ${err.message}`)
  }
}

async function searchFiles (after) {

  try {
    const response = await hubspotClient.files.filesApi.doSearch(undefined, after, undefined, 100)
    return response
  } catch (e) {
    e.message === 'HTTP request failed'
      ? console.error(JSON.stringify(e.response, null, 2))
      : console.error(e)
  }
}

async function batchReadAssociations () {
  try {
    const fromObjType = 'note'
    const toObjType = 'contact'
    return await hubspotClient.crm.associations.v4.batchApi.getPage(fromObjType, toObjType)
  } catch (err) {
    console.error(err)
  }
}

async function searchNotes () {

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

async function getNotes (after) {
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

async function getContacts (after) {
  const limit = 100
  const properties = allProperties
  const propertiesWithHistory = undefined
  const associations = ['notes', 'companies']
  const archived = false
  try {
    const response = await hubspotClient.crm.contacts.basicApi.getPage(
      limit, 
      after, 
      properties, 
      propertiesWithHistory, 
      associations, 
      archived
    )
    
    return response
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
    return response
  } catch (err) {
    console.error(`Failed to get contact by id: ${err}`)
  }
}

export {
  getSignedUrlForPrivateFile,
  downloadFile,
  searchFiles,
  batchReadAssociations,
  searchNotes,
  getNotes,
  getContacts,
  searchContacts,
  getContactById,
  deleteContact,
  upsertBatchOfContacts
}