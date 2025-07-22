
// Description: This script fetches all notes, contacts, and files from the API and downloads all attachments.

import { searchFiles, getNotes, getContacts } from './utils/api.js'
import { extractNonValidPhoneNumbers, extractForeignPhoneNumbers } from './utils/data-processing.js';
import { getAllPagesOfObjects, downloadAllAttachments } from './utils/fetch-and-save.js'
import { joinContactsWithNotes, setTypeOfNote, deleteInvalidNotes, moveCommentToNote, deleteContactsWithForeignNumbers, formatAllPhones, filterContactsWithFunction } from './utils/clean-and-save.js'

import { inspect } from 'util';
import { join } from 'path';
global.log = (obj) => console.log(inspect(obj, { depth: null, colors: true }));

try {

  // await deleteInvalidNotes()
  
  // await joinContactsWithNotes(process.env.CONTACTS_PATH, process.env.NOTES_PATH)

  // await setTypeOfNote(process.env.NOTES_PATH)

  // await moveCommentToNote()

  // await formatAllPhones(process.env.CONTACTS_PATH)

  // await filterContactsWithFunction(process.env.CONTACTS_PATH, extractForeignPhoneNumbers)

  // await deleteContactsWithForeignNumbers(process.env.CONTACTS_PATH)

  // console.log('Fetching all contact data')
  // await getAllPagesOfObjects(getContacts)

  // console.log('Fetching all note data')
  // await getAllPagesOfObjects(getNotes)

  // console.log('Fetching all file data')
  // await getAllPagesOfObjects(searchFiles)

  // console.log('Downloading all attachments...');
  // await downloadAllAttachments() 
  log('Script completed successfully!');
  
} catch (err) {
  console.error(`An error within the main process: ${err}`)
}



