import { useState, FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchInputProps {
  value?: string
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({
  value: initialValue = '',
  onSearch,
  placeholder = 'Search...',
  className
}: SearchInputProps) {
  const [searchInput, setSearchInput] = useState(initialValue)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch(searchInput.trim())
  }

  const handleClear = () => {
    setSearchInput('')
    onSearch('')
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex gap-2">
        <Input
          type="search"
          placeholder={placeholder}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
        {searchInput && (
          <Button type="button" variant="ghost" onClick={handleClear}>
            Clear
          </Button>
        )}
      </div>
    </form>
  )
}
