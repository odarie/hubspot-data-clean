

import { formatNoteBody, normalizePhoneNumbers, extractForeignPhoneNumbers, extractNonValidPhoneNumbers } from './data-processing.js' 
import { createNoteToContact, deleteContact, deleteNote, upsertBatchOfContacts } from './api.js'
import { readJsonFile, generatePath, writeJsonFile } from './file-utilities.js'
import { sleep } from './helpers.js'


async function joinContactsWithNotes (contactsPath, notesPath) {

  // Read the contacts and notes data from the files
  const contacts = await readJsonFile(contactsPath)
  const notes = await readJsonFile(notesPath)

  log(`Read ${contacts.length} contacts`)
  log(`Read ${notes.length} notes`) 

  // Create a map of notes for quick lookup
  const noteMap = new Map();
  for (const note of notes) {
    noteMap.set(note.id, note);
  }
  log(`Created a map of ${noteMap.size} notes`)
  
  // Join the contacts with their associated notes
  for (const contact of contacts) {
    
    contact.associations ??= {}
    contact.associations.notes ??= {}
    contact.associations.notes.results ??= []

    contact.associations.notes.results = contact.associations.notes.results.map( ({ id, type }) => {
      return { id, type, note: noteMap.get(id)}
    })
  }
  log(`Joined ${contacts.length} contacts with notes`)

  // Save the joined contacts to a new file
  const path = generatePath("joinedContactsandNotes")
  await writeJsonFile(path, contacts)
  log(`Saved joined contacts to ${path}`)
}

async function deleteInvalidNotes () {

  // Read the notes data from the file
  const notes = await readJsonFile(process.env.NOTES_PATH)
  const contacts = await readJsonFile(process.env.CONTACTS_PATH)
  log(`Read ${notes.length} notes`)
  log(`Read ${contacts.length} contacts`)

  // Create a map of notes for quick lookup
  const noteToContactMap = new Map()

  for (const contact of contacts) {
    // From each contact, get the associated notes' ids
    const noteIds = contact.associations?.notes?.results || []
    
    for (const note of noteIds) {
      // For each note id, set the contact id in the map
      noteToContactMap.set(note.id, contact.id)
    }
  }
  log(`Created a map of ${noteToContactMap.size} notes`)
  
  let count = 0

  // Iterate through the notes and check if they are associated with a contact
  for (const note of notes) {
    const { hs_attachment_ids, hs_note_body } = note.properties

    // Look up the contact id from the map
    const contactId = noteToContactMap.get(note.id)

    // Check if the note is empty and has no attachments
    const isEmpty = !hs_note_body && !hs_attachment_ids
    const isOrphaned = !contactId

    if (isEmpty || isOrphaned) {
      try {
        await deleteNote(note.id)
        log(`Deleted note with id ${note.id}`)
        await sleep(1000)
        count++
      } catch (err) {
        console.error(`An error within the deleteInvalidNotes function: ${err}`)
      }
    }
  }
  log(`There are ${count} deleted notes`)
  return count
}

async function setTypeOfNote() {
  
}

async function moveCommentToNote() {

  const contactData = await readJsonFile(process.env.CONTACTS_PATH)
  log(`Read ${contactData.length} contacts`)

    const generalNoteContacts = contactData.filter(contact => {
    return contact.properties.type.includes('blacklist_chat') && contact.properties.comment
  })
  log(`Found ${generalNoteContacts.length} contacts with general notes`)

  for (const contact of generalNoteContacts) {
    
    const { comment, hs_object_id, createdate } = contact.properties
    // log(`Contact ${hs_object_id} has comment: ${comment}`)

      const note = formatNoteBody('general', createdate, comment)

      const response = await createNoteToContact(note, hs_object_id)

      if (response) {
        log(`Created note with id ${response.id} for contact ${hs_object_id}`)
      } else {
        log(`Failed to create note for contact ${hs_object_id}`)
      }
      await sleep(500)
  }

  
}

async function formatAllPhones (contactsPath) {

  try {

    const contactData = await readJsonFile(contactsPath)
    log(`Read ${contactData.length} contacts`)
  
    const fixedContacts = normalizePhoneNumbers(contactData)
    log(`Normalized number of ${fixedContacts.length} contacts`)

    const inputs = fixedContacts.map(contact => {
      return {
        id: contact.id,
        properties: contact.phonenumbers
      }
    })
    
    const response = await upsertBatchOfContacts(inputs)
    log(`Upserted contacts with ${response}`)


  } catch (err) {
    console.error(`An error within the formatAllPhones function: ${err}`)
  }
}

async function filterContactsWithFunction(contactsPath, filteringFunction) {

  try {

    const contacts = await readJsonFile(contactsPath)
    log(`Read ${contacts.length} contacts`)

    const filteredContacts = filteringFunction(contacts)
    log(`Filtered ${filteredContacts.length} contacts with ${filteringFunction.name}`)

  } catch (err) {
    console.error(`An error within the formatAllPhones function: ${err}`)
  }
}

async function deleteContactsWithForeignNumbers (contactsPath) {

  try {
    // Read the contacts data from the file
    const contacts = await readJsonFile(contactsPath)
   
    // Filter out contacts with foreign phone numbers
    const contactsForDeletion = extractForeignPhoneNumbers(contacts)
    log(`Deleting ${contactsForDeletion.length} contacts with foreign phone numbers`)

    for (const contact of contactsForDeletion) {
      log(`Deleting contact with id ${contact.id} and name: ${contact.firstname} ${contact.lastname}`)

        const success = await deleteContact(contact.id)

        if (success) {
          log(`Deleted contact with id ${contact.id}`)
        } else {
          log(`Failed to delete contact with id ${contact.id}`)
        }
    }

  } catch (err) {
    console.error(`An error within the deleteContactsWithForeignNumbers function: ${err}`)
  }
}

export {
  deleteContactsWithForeignNumbers,
  filterContactsWithFunction,
  formatAllPhones,
  moveCommentToNote,
  setTypeOfNote,
  joinContactsWithNotes,
  deleteInvalidNotes
}
