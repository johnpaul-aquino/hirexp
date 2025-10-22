'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SkillsInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  maxItems?: number
}

export function SkillsInput({
  value = [],
  onChange,
  placeholder = 'Add a skill...',
  maxItems = 20,
}: SkillsInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleAddSkill = () => {
    const trimmedValue = inputValue.trim()

    if (!trimmedValue) return
    if (value.includes(trimmedValue)) {
      setInputValue('')
      return
    }
    if (value.length >= maxItems) {
      return
    }

    onChange([...value, trimmedValue])
    setInputValue('')
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    onChange(value.filter((skill) => skill !== skillToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={value.length >= maxItems}
        />
        <Button
          type="button"
          onClick={handleAddSkill}
          disabled={!inputValue.trim() || value.length >= maxItems}
          variant="outline"
        >
          Add
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((skill) => (
            <Badge key={skill} variant="secondary" className="gap-1 pr-1">
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {value.length >= maxItems && (
        <p className="text-sm text-muted-foreground">
          Maximum {maxItems} items reached
        </p>
      )}
    </div>
  )
}
