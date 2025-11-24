import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface BulkImportResult {
  success: boolean
  totalEvents: number
  successCount: number
  failureCount: number
  skippedCount: number
  results: Array<{
    eventTitle: string
    status: 'success' | 'failure' | 'skipped'
    eventId?: string
    error?: string
    details?: string
  }>
}

export function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<BulkImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/json') {
      setFile(selectedFile)
      setError(null)
      setResult(null)
    } else {
      setError('Please select a valid JSON file')
      setFile(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)
    setResult(null)

    try {
      // Read file content
      const fileContent = await file.text()
      const jsonData = JSON.parse(fileContent)

      // Send to API
      const response = await fetch('/api/events/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setResult(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bulk Import Events</h1>
          <p className="text-muted-foreground">Upload a JSON file to import multiple events at once</p>
        </div>
        <Link to="/events">
          <Button variant="outline">Back to Events</Button>
        </Link>
      </div>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Upload JSON File</CardTitle>
          <CardDescription>
            Select a JSON file containing events to import. See the{' '}
            <a
              href="/sample-bulk-upload.json"
              download
              className="text-primary underline"
            >
              sample format
            </a>{' '}
            for reference.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              disabled={uploading}
              className="flex-1"
            />
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="min-w-[120px]"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
            {(file || result) && (
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            )}
          </div>

          {file && !result && (
            <Alert>
              <AlertDescription>
                Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Display */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
            <CardDescription>
              Processed {result.totalEvents} events: {result.successCount} succeeded,{' '}
              {result.skippedCount} skipped, {result.failureCount} failed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Summary */}
            <div className="mb-4 grid grid-cols-4 gap-4">
              <div className="rounded-lg border p-3">
                <div className="text-2xl font-bold">{result.totalEvents}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="text-2xl font-bold text-green-700">{result.successCount}</div>
                <div className="text-xs text-green-600">Succeeded</div>
              </div>
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <div className="text-2xl font-bold text-yellow-700">{result.skippedCount}</div>
                <div className="text-xs text-yellow-600">Skipped</div>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="text-2xl font-bold text-red-700">{result.failureCount}</div>
                <div className="text-xs text-red-600">Failed</div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {result.results.map((item, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-3 ${
                    item.status === 'success'
                      ? 'border-green-200 bg-green-50'
                      : item.status === 'skipped'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{item.eventTitle}</div>
                      {item.details && (
                        <div className="text-sm text-muted-foreground">{item.details}</div>
                      )}
                      {item.error && (
                        <div className="text-sm text-red-600">{item.error}</div>
                      )}
                    </div>
                    <div className="ml-4">
                      {item.status === 'success' && item.eventId && (
                        <Link to={`/events/${item.eventId}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {result.successCount > 0 && (
              <div className="mt-4">
                <Link to="/events">
                  <Button className="w-full">View All Events</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Import Format</CardTitle>
          <CardDescription>Expected JSON structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Required fields:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><code>title</code> - Event title (string)</li>
              <li><code>startDate</code> - Start date (YYYY-MM-DD format)</li>
            </ul>
            <p className="mt-4"><strong>Optional fields:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><code>endDate</code> - End date</li>
              <li><code>description</code> - Event description</li>
              <li><code>tags</code> - Array of tag names</li>
              <li><code>primaryTag</code> - Primary tag name</li>
              <li><code>sources</code> - Array of source objects</li>
              <li><code>counterNarrative</code> - Counter-narrative object</li>
              <li><code>analysis</code> - Category-specific analysis (future use)</li>
              <li><code>relationships</code> - Event relationships (future use)</li>
              <li><code>metadata</code> - Custom metadata (future use)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
