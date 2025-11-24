/**
 * Background service worker for the extension
 * Handles offline queue and message passing
 */

import { processOfflineQueue, queueAction, getQueueStatus, clearQueue } from './offlineQueue'

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Accountability Tracker extension installed')

  // Set default settings
  chrome.storage.sync.get(['apiUrl'], (result) => {
    if (!result.apiUrl) {
      chrome.storage.sync.set({ apiUrl: 'http://localhost:3001' })
    }
  })
})

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'queueAction') {
    queueAction(request.actionType, request.payload)
      .then(() => {
        sendResponse({ success: true })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true // Keep message channel open
  }

  if (request.action === 'processQueue') {
    processOfflineQueue()
      .then((results) => {
        sendResponse({ success: true, results })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }

  if (request.action === 'getQueueStatus') {
    getQueueStatus()
      .then((status) => {
        sendResponse({ success: true, ...status })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }

  if (request.action === 'clearQueue') {
    clearQueue()
      .then(() => {
        sendResponse({ success: true })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }

  return false
})

// Process offline queue periodically when online
chrome.alarms.create('processQueue', { periodInMinutes: 5 })

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'processQueue') {
    processOfflineQueue().catch(console.error)
  }
})

// Process queue when extension loads
processOfflineQueue().catch(console.error)
