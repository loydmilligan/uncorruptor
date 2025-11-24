import React, { useState, useEffect } from 'react'
import { testConnection } from '../../lib/api'

interface SettingsProps {
  onBack: () => void
}

export default function Settings({ onBack }: SettingsProps) {
  const [apiUrl, setApiUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'failure' | null>(null)
  const [queueStatus, setQueueStatus] = useState<{
    count: number
    oldestTimestamp: number | null
  } | null>(null)

  useEffect(() => {
    // Load current settings
    chrome.storage.sync.get(['apiUrl'], (result) => {
      setApiUrl(result.apiUrl || 'http://localhost:3001')
    })

    // Load queue status
    chrome.runtime.sendMessage({ action: 'getQueueStatus' }, (response) => {
      if (response?.success) {
        setQueueStatus({
          count: response.count || 0,
          oldestTimestamp: response.oldestTimestamp || null,
        })
      }
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await chrome.storage.sync.set({ apiUrl })
      setTimeout(() => {
        setSaving(false)
        alert('Settings saved successfully!')
      }, 500)
    } catch (err) {
      alert('Failed to save settings')
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      // Temporarily save the URL to test it
      await chrome.storage.sync.set({ apiUrl })
      const isConnected = await testConnection()
      setTestResult(isConnected ? 'success' : 'failure')
    } catch {
      setTestResult('failure')
    } finally {
      setTesting(false)
    }
  }

  const handleClearQueue = async () => {
    if (!confirm('Are you sure you want to clear all queued actions?')) {
      return
    }

    chrome.runtime.sendMessage({ action: 'clearQueue' }, (response) => {
      if (response?.success) {
        setQueueStatus({ count: 0, oldestTimestamp: null })
        alert('Queue cleared successfully')
      } else {
        alert('Failed to clear queue')
      }
    })
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>
        <h2>Settings</h2>
      </div>

      <div className="form-group">
        <label htmlFor="apiUrl">API URL</label>
        <input
          id="apiUrl"
          type="url"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="http://localhost:3001"
        />
        <small>The URL of your Accountability Tracker backend</small>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={testing}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: 'white',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {testResult === 'success' && (
        <div className="success-message">
          ✓ Connection successful!
        </div>
      )}

      {testResult === 'failure' && (
        <div className="error-message">
          ✗ Connection failed. Check the URL and try again.
        </div>
      )}

      {queueStatus && queueStatus.count > 0 && (
        <>
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
              Offline Queue
            </h3>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '10px' }}>
              {queueStatus.count} action{queueStatus.count !== 1 ? 's' : ''} queued
              {queueStatus.oldestTimestamp && (
                <>
                  {' '}
                  (oldest: {new Date(queueStatus.oldestTimestamp).toLocaleString()})
                </>
              )}
            </div>
            <button
              type="button"
              onClick={handleClearQueue}
              style={{
                padding: '8px 12px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              Clear Queue
            </button>
          </div>
        </>
      )}

      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          About
        </h3>
        <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.6 }}>
          <p>Accountability Tracker Extension v1.0.0</p>
          <p style={{ marginTop: '6px' }}>
            Quick capture tool for tracking political accountability events.
          </p>
        </div>
      </div>
    </div>
  )
}
