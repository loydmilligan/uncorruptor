import { useNavigate } from 'react-router-dom'
import { useCreateEvent } from '@/hooks/useEvents'
import { EventForm } from '@/components/EventForm'
import { Card, CardContent } from '@/components/ui/card'

export function CreateEventPage() {
  const navigate = useNavigate()
  const createEvent = useCreateEvent()

  const handleSubmit = async (data: {
    title: string
    description?: string
    eventDate: string
    tagIds: string[]
  }) => {
    try {
      const result = await createEvent.mutateAsync(data)
      navigate(`/events/${result.data.id}`)
    } catch (err) {
      console.error('Failed to create event:', err)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      <Card>
        <CardContent className="pt-6">
          <EventForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/events')}
            isSubmitting={createEvent.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
