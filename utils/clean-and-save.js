import fs from 'fs'
import path from 'path'
import { extractPhoneNumbers, extractForeignPhoneNumbers } from './data-processing.js' 
import { log } from 'console'
import { deleteContact } from './api.js'

async function deleteContactsWithForeignNumbers (contactsPath) {

  try {

    // Read the contacts data from the file
    const contacts = fs.readFileSync(contactsPath, 'utf8')
    const contactsData = JSON.parse(contacts)
   
    // Filter out contacts with foreign phone numbers
    const contactsForDeletion = extractForeignPhoneNumbers(contactsData)

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
    console.error(`An error within the formatAllPhones function: ${err}`)
  }
}

export {
  deleteContactsWithForeignNumbers
}
