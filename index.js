

const { sleep } = require('./utils/helpers.js')
const { pairAttachmentToNote } = require('./utils/data-processing.js')
const { writeJsonFile, readJsonFile, generatePath, generateFilePath, generateDirectoryPath } = require('./utils/file-utilities.js')
const { getSignedUrlForPrivateFile, downloadFile, searchFiles, getNotes, getContacts } = require('./utils/api.js')

require('dotenv').config()

global.log = (obj) => console.dir(obj, { depth: null, colors: true });

(async () => {
  try {

    // console.log('Fetching all contact data')
    // await getAllPagesOfObjects(getContacts)

    // console.log('Fetching all note data')
    // await getAllPagesOfObjects(getNotes)

    // console.log('Fetching all file data')
    // await getAllPagesOfObjects(searchFiles)

    console.log('Downloading all attachments...');
    await downloadAllAttachments() 
    
  } catch (err) {
    console.error(`An error within the main process: ${err}`)
  }
})();

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





