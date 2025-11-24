/**
 * Offline queue for storing actions when the API is unreachable
 */

interface QueuedAction {
  id: string
  timestamp: number
  actionType: 'createEvent' | 'addSource'
  payload: any
  retries: number
}

const MAX_RETRIES = 3
const QUEUE_KEY = 'offlineQueue'

/**
 * Add an action to the offline queue
 */
export async function queueAction(actionType: string, payload: any): Promise<void> {
  const queue = await getQueue()

  const action: QueuedAction = {
    id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
    timestamp: Date.now(),
    actionType: actionType as any,
    payload,
    retries: 0,
  }

  queue.push(action)
  await saveQueue(queue)
}

/**
 * Process all queued actions
 */
export async function processOfflineQueue(): Promise<{
  success: number
  failed: number
}> {
  const queue = await getQueue()
  if (queue.length === 0) {
    return { success: 0, failed: 0 }
  }

  let successCount = 0
  let failedCount = 0
  const remainingQueue: QueuedAction[] = []

  for (const action of queue) {
    try {
      await processAction(action)
      successCount++
    } catch (error) {
      action.retries++

      if (action.retries < MAX_RETRIES) {
        // Retry later
        remainingQueue.push(action)
      } else {
        // Max retries reached, discard
        failedCount++
        console.error(`Action ${action.id} failed after ${MAX_RETRIES} retries:`, error)
      }
    }
  }

  await saveQueue(remainingQueue)
  return { success: successCount, failed: failedCount }
}

/**
 * Process a single queued action
 */
async function processAction(action: QueuedAction): Promise<void> {
  const settings = await chrome.storage.sync.get(['apiUrl'])
  const apiUrl = settings.apiUrl || 'http://localhost:3001'

  if (action.actionType === 'createEvent') {
    const response = await fetch(`${apiUrl}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(action.payload),
    })

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }
  } else if (action.actionType === 'addSource') {
    const { eventId, ...sourceData } = action.payload
    const response = await fetch(`${apiUrl}/api/events/${eventId}/sources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sourceData),
    })

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }
  }
}

/**
 * Get the current queue from storage
 */
async function getQueue(): Promise<QueuedAction[]> {
  const result = await chrome.storage.local.get([QUEUE_KEY])
  return result[QUEUE_KEY] || []
}

/**
 * Save the queue to storage
 */
async function saveQueue(queue: QueuedAction[]): Promise<void> {
  await chrome.storage.local.set({ [QUEUE_KEY]: queue })
}

/**
 * Clear the entire queue
 */
export async function clearQueue(): Promise<void> {
  await chrome.storage.local.set({ [QUEUE_KEY]: [] })
}

/**
 * Get queue status
 */
export async function getQueueStatus(): Promise<{
  count: number
  oldestTimestamp: number | null
}> {
  const queue = await getQueue()
  return {
    count: queue.length,
    oldestTimestamp: queue.length > 0 ? queue[0].timestamp : null,
  }
}
