

import { normalizePhoneNumbers, extractForeignPhoneNumbers, extractNonValidPhoneNumbers } from './data-processing.js' 
import { deleteContact, upsertBatchOfContacts } from './api.js'
import { readJsonFile } from './file-utilities.js'


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

    const batchSize = 100

    for (let i = 0; i < inputs.length; i += batchSize) {
      const batch = { 
        inputs: inputs.slice(i, i + batchSize)
      }
      log(`Processing batch ${i / batchSize + 1} with ${batch.inputs.length} contacts`)

      try {

        const response = await upsertBatchOfContacts(batch)
        log(`Upserted contacts: ${response.results.length} in batch ${i / batchSize + 1} with status ${response.status}`)

      } catch (err) {
        console.error(`Failed to update batch starting at index ${i}: ${err}`)
      }
    }

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
  formatAllPhones
}
