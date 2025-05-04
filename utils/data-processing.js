
// This file contains functions for data processing

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
  // Leave only phone numbers among all properties
    const numberObjArr = objArr.map( e => {

      const { id } = e
      const { phone, mobilephone, third_phone_number, fourth_phone_number, firstname, lastname, type } = e.properties
      const numbers = { phone, mobilephone, third_phone_number, fourth_phone_number }

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
   return numberObjArr
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
      
      // Check if the number starts with 380 or 0 and has a type
      if (!(cleaned.startsWith('380') || cleaned.startsWith('0')) && !contact.type) {
        log(`Untyped contact ${contact.firstname} ${contact.lastname} has a foreign number: ${cleaned}`)
        counter++
        return true
      }
    }
  })
  log(`Found ${counter} foreign phone numbers`)
  return filteredContacts
}


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
  extractForeignPhoneNumbers
}