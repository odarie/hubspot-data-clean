
// Utility functions for file operations

import fs from 'node:fs/promises'
import path from 'node:path'
import { makeTimestamp } from './helpers.js'

async function writeJsonFile(path, data) {
  const jsonString = JSON.stringify(data, null, 2)
  await fs.writeFile(path, jsonString)
  log(`Saved JSON data to ${path}`)
}

async function readJsonFile(path) {
  const data = await fs.readFile(path, 'utf8')
  return JSON.parse(data)
}

function generatePath (name) {
  const timestamp = makeTimestamp()
  return `${name}-${timestamp}.json`
}

async function writeFileFromBuffer(response, filePath) {
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  await fs.writeFile(filePath, buffer)

}

async function generateDirectoryPath () {
  try {

    const timestamp = makeTimestamp()
    const directory = path.resolve(`./downloads-${timestamp}`)
    await fs.mkdir(directory, { recursive: true })
    console.log(`Created downloads directory: ${directory}`)
    return directory

  } catch (err) {
    console.error(`Failed to create directory: ${err.message}`)
    throw err
  }
}

function generateFilePath (directory, fileName, fileId, noteId, extension) {
  const newFileName = `${fileName}__${fileId}__note-${noteId}.${extension}`
  return path.join(directory, newFileName)
}

export {
  writeJsonFile,
  readJsonFile,
  writeFileFromBuffer,
  generatePath,
  generateFilePath,
  generateDirectoryPath
}