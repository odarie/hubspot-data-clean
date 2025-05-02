
// This module fetches data from the API and saves it to a file
// and downloads attachments from notes to a specified directory

import dotenv from 'dotenv'
import { sleep } from './helpers.js'
import { pairAttachmentToNote } from './data-processing.js'
import { writeJsonFile, readJsonFile, generatePath, generateFilePath, generateDirectoryPath } from './file-utilities.js'
import { getSignedUrlForPrivateFile, downloadFile } from './api.js'

dotenv.config()

// Retrieve all contact, notes and file json data and save them to a file
async function getAllPagesOfObjects (fetchFunction) {
  const allData = []
  let after
  console.log(`Fetching data from ${fetchFunction.name}`)

  // Iterate a paged function, save the data 
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
  const jsonPath = generatePath(functionName)
  console.log(`Path: ${jsonPath}`)

  // Save contacts as JSON to the file
  await writeJsonFile (jsonPath, allData)
  
  // Read and return result
  const savedData = await readJsonFile(jsonPath)
  log(`Total objects saved by ${functionName}: ${savedData.length}`)
  return savedData
}

// Download all attachments from notes and save them to a directory
async function downloadAllAttachments() {

  // Make a new directory to save attachments to
  console.log('Creating download directory...')
  const downloadDirectory = await generateDirectoryPath()
  console.log(`Download directory: ${downloadDirectory}`)

  // Retrieve data on notes
  const notes = await readJsonFile(process.env.NOTES_PATH)
  
  // Make array from attachments, each el contains id and note id
  const idsPairArray = pairAttachmentToNote(notes)
  log(`Dowloading files: ${idsPairArray.length}`)

  
  for (const { noteId, attachmentId } of idsPairArray) {

    try {
      // Get temporary URL to download a private file
      const result = await getSignedUrlForPrivateFile(attachmentId)

      if (!result) {
        console.error(`Missing or invalid response for attachmentId: ${attachmentId}, noteId: ${noteId}`)
        continue
      }
      
      const { name, extension, url } = result
      // Create file path based on name, id, etc
      const filePath = generateFilePath(downloadDirectory, name, attachmentId, noteId, extension)
      await downloadFile(url, filePath)

      log(filePath)
      
      await sleep(300)

    } catch (err) {
      console.error(`Error for attachmentId: ${attachmentId}, noteId: ${noteId}`)
    }
  } 
}

export { 
  getAllPagesOfObjects, 
  downloadAllAttachments 
}