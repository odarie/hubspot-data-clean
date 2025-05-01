
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
  // Leave only phone numbers and the corresponding id for each contact
    const numberObjArr = objArr.map( e => {

      const { id } = e
      const { phone, mobilephone, third_phone_number, fourth_phone_number } = e.phoneProperties

      const numbers = { phone, mobilephone, third_phone_number, fourth_phone_number }

      const extractedNumbers = Object.fromEntries(
        Object.entries(numbers).filter(([_, value]) => value !== null)
      );
      log(extractedNumbers)
      const cleanedContact = {
        id: id,
        phonenumbers: extractedNumbers
      }
      return cleanedContact
   })
   return numberObjArr
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

module.exports = {
  createFilterGroups,
  extractPhoneNumbers,
  pairAttachmentToNote
}