
// Description: This script fetches all notes, contacts, and files from the API and downloads all attachments.

import { searchFiles, getNotes, getContacts } from './utils/api.js'
import { getAllPagesOfObjects, downloadAllAttachments } from './utils/fetch-and-save.js'
import { deleteContactsWithForeignNumbers } from './utils/clean-and-save.js'

global.log = (obj) => console.dir(obj, { depth: null, colors: true });

try {

  await deleteContactsWithForeignNumbers(process.env.CONTACTS_PATH)
  

  // console.log('Fetching all contact data')
  // await getAllPagesOfObjects(getContacts)

  // console.log('Fetching all note data')
  // await getAllPagesOfObjects(getNotes)

  // console.log('Fetching all file data')
  // await getAllPagesOfObjects(searchFiles)

  // console.log('Downloading all attachments...');
  // await downloadAllAttachments() 
  
} catch (err) {
  console.error(`An error within the main process: ${err}`)
}



