import React, { useState, useEffect } from 'react'
import { extractPageData } from '../content/extractPageData'
import { testConnection } from '../lib/api'
import NewEventForm from './components/NewEventForm'
import AddSourceForm from './components/AddSourceForm'
import Settings from './components/Settings'
import './App.css'

type View = 'main' | 'new-event' | 'add-source' | 'settings'

export default function App() {
  const [view, setView] = useState<View>('main')
  const [pageData, setPageData] = useState<any>(null)
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [queueCount, setQueueCount] = useState(0)

  useEffect(() => {
    // Extract page data when popup opens
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: 'extractPageData' },
          (response) => {
            if (response) {
              setPageData(response)
            }
          }
        )
      }
    })

    // Check API connection
    testConnection().then(setIsConnected)

    // Check queue status
    chrome.runtime.sendMessage(
      { action: 'getQueueStatus' },
      (response) => {
        if (response?.success) {
          setQueueCount(response.count || 0)
        }
      }
    )
  }, [])

  const handleProcessQueue = async () => {
    chrome.runtime.sendMessage(
      { action: 'processQueue' },
      (response) => {
        if (response?.success) {
          setQueueCount(0)
          alert(`Processed ${response.results.success} queued actions`)
        }
      }
    )
  }

  if (view === 'new-event') {
    return (
      <div className="popup-container">
        <NewEventForm
          pageData={pageData}
          onBack={() => setView('main')}
          onSuccess={() => {
            alert('Event created successfully!')
            setView('main')
          }}
        />
      </div>
    )
  }

  if (view === 'add-source') {
    return (
      <div className="popup-container">
        <AddSourceForm
          pageData={pageData}
          onBack={() => setView('main')}
          onSuccess={() => {
            alert('Source added successfully!')
            setView('main')
          }}
        />
      </div>
    )
  }

  if (view === 'settings') {
    return (
      <div className="popup-container">
        <Settings onBack={() => setView('main')} />
      </div>
    )
  }

  return (
    <div className="popup-container">
      <header className="header">
        <h1>Accountability Tracker</h1>
        <button
          className="settings-button"
          onClick={() => setView('settings')}
          title="Settings"
        >
          ⚙️
        </button>
      </header>

      <div className="status">
        <div className={`status-indicator ${isConnected ? 'online' : 'offline'}`}>
          {isConnected ? '🟢 Connected' : '🔴 Offline'}
        </div>
        {queueCount > 0 && (
          <button className="queue-button" onClick={handleProcessQueue}>
            Process {queueCount} queued
          </button>
        )}
      </div>

      {pageData && (
        <div className="page-info">
          <h2 className="page-title">{pageData.title}</h2>
          <p className="page-domain">{pageData.domain}</p>
          {pageData.datePublished && (
            <p className="page-date">{pageData.datePublished}</p>
          )}
        </div>
      )}

      <div className="actions">
        <button
          className="action-button primary"
          onClick={() => setView('new-event')}
        >
          Create New Event
        </button>
        <button
          className="action-button secondary"
          onClick={() => setView('add-source')}
        >
          Add Source to Event
        </button>
      </div>
    </div>
  )
}
