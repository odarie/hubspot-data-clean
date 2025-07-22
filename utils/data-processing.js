
// This file contains functions for data processing

import { log } from "console";

function formatNoteBody (type, timestamp, message) {
  
  const title = `[${type.trim().toUpperCase()}]`
  const formattedTimestamp = new Date(timestamp).toLocaleString('uk-UA')

  const htmlBody = `
  <strong>${title}</strong><br>
  <em>${formattedTimestamp}</em><br><br>
  <p>${message.trim().replace(/\n/g, '<br>')}</p>
  `
  return htmlBody

}

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

function normalizePhoneNumbers (objArr) {

  const contacts = extractPhoneNumbers(objArr)
  log(`Extracted ${contacts.length} contacts with phone numbers`)

  // Loop over each contact and transform the phone numbers
  const fixedContacts = contacts.map(contact => {

    // Turn phonenumbers into an array of [key, value] pairs
    const transformedPhones = Object.fromEntries(

      // For each property name and value
      Object.entries(contact.phonenumbers || {}).map(([key, value]) => {

        // Remove non-digit characters from the phone number
        const digits = (value || '').replace(/\D/g, '')
        
        // Normalize the phone number
        let normalized = digits
        if (digits.length === 10 && digits.startsWith('0')) {
          normalized = '+38' + digits
        } else if (digits.length === 12 && digits.startsWith('380')) {
          normalized = '+' + digits
        }

        return [key, normalized]
      })
    )

    return {
      ...contact,
      phonenumbers: transformedPhones
    }
  })
  
  return fixedContacts
}

function extractPhoneNumbers(objArr) {

  // Group all phone numbers into a single object and apply two filters
    const numberObjArr = objArr.map( e => {

      const { id } = e
      const { phone, mobilephone, third_phone_number, fourth_phone_number, firstname, lastname, type } = e.properties
      const numbers = { phone, mobilephone, third_phone_number, fourth_phone_number }

      // Filter out phones that are null or empty
      const extractedNumbers = Object.fromEntries(
        Object.entries(numbers).filter(([_, value]) => value !== null)
      );
      
      const cleanedContact = {
        id: id,
        type: type,
        firstname: firstname,
        lastname: lastname,
        phonenumbers: extractedNumbers
      }
      return cleanedContact
   })
  // Filter out contacts with no phone numbers
   return numberObjArr.filter(contact => Object.keys(contact.phonenumbers).length > 0)
}

// Filtering functions that return contacts with corresponding phone numbers

function extractNonValidPhoneNumbers(objArr) {

  let counter = 0
  const contacts = extractPhoneNumbers(objArr)

  log(`Extracted ${contacts.length} contacts with phone numbers`)

  const filteredContacts = contacts.filter(contact => {

    for (const key in contact.phonenumbers) {

      const value = contact.phonenumbers[key]
      if (!value) continue
      const cleaned = value.replace(/\D/g, '')
      
      // Check if the number contains at least 10 digits and starts with 380 or 0
      if (cleaned.length < 10 || !(cleaned.startsWith('380') || cleaned.startsWith('0'))) {
        log(`Contact ${contact.firstname} ${contact.lastname} has a non-valid number: ${cleaned}`)
        counter++
        return true
      }
    }
    return false // Only return false after checking all numbers
  })
  log(`Found ${counter} foreign phone numbers`)
  return filteredContacts
}

function extractForeignPhoneNumbers(objArr) {

  let counter = 0
  
  const contacts = extractPhoneNumbers(objArr)

  log(`Extracted ${contacts.length} contacts with phone numbers`)

  const filteredContacts = contacts.filter(contact => {

    for (const key in contact.phonenumbers) {

      const value = contact.phonenumbers[key]
      if (!value) continue
      const cleaned = value.replace(/\D/g, '')
      
      // Check if the number starts with 380 or 0
      if (!(cleaned.startsWith('380') || cleaned.startsWith('0'))) {
        log(`Untyped contact ${contact.firstname} ${contact.lastname} has a foreign number: ${cleaned}`)
        counter++
        return true
      }
    }
  })
  log(`Found ${counter} foreign phone numbers`)
  return filteredContacts
}

// ...

function pairAttachmentToNote (notes) {
  // Extract from each note attachment ids
  // Pair each with a note id to make an array of objects
  return notes.flatMap( note => {
    const { hs_attachment_ids } = note.properties
    const idArray = hs_attachment_ids ? hs_attachment_ids.split(';').filter(Boolean) : []
    return idArray.map( attachmentId => ({
      noteId: note.id,
      attachmentId
    }))
  })
}

export {
  createFilterGroups,
  extractPhoneNumbers,
  pairAttachmentToNote,
  extractForeignPhoneNumbers,
  extractNonValidPhoneNumbers,
  normalizePhoneNumbers,
  formatNoteBody
}
