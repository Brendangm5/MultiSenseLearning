"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useSpeechSynthesis } from 'react-speech-kit'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Play, Pause, Volume2 } from 'lucide-react'

const MultiSenseLearning = () => {
  const [text, setText] = useState('')
  const [typedText, setTypedText] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [rate, setRate] = useState(1)
  const [syncWithTyping, setSyncWithTyping] = useState(true)
  const { speak, cancel, speaking, supported, voices } = useSpeechSynthesis()
  const typingRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (syncWithTyping && typedText) {
      const words = typedText.split(' ')
      const wordsPerMinute = 200 // Adjust this value to change the base speaking rate
      const newRate = (words.length / text.split(' ').length) * (wordsPerMinute / 60)
      setRate(Math.max(0.1, Math.min(newRate, 10))) // Clamp rate between 0.1 and 10
    }
  }, [typedText, syncWithTyping, text])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    setTypedText('')
  }

  const handleTyping = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Backspace') {
      setTypedText(prev => prev.slice(0, -1))
    } else if (e.key.length === 1) {
      setTypedText(prev => prev + e.key)
    }
  }

  const togglePlayPause = () => {
    if (speaking) {
      cancel()
      setIsPlaying(false)
    } else {
      speak({ text, rate, volume })
      setIsPlaying(true)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result
        if (typeof content === 'string') {
          setText(content)
          toast({
            title: "File uploaded successfully",
            description: "The content has been loaded into the text area.",
          })
        }
      }
      reader.readAsText(file)
    }
  }

  if (!supported) {
    return <div>Your browser does not support speech synthesis.</div>
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">MultiSense Learning</h1>
      
      <div className="space-y-2">
        <Label htmlFor="text-input">Enter or paste your text here:</Label>
        <textarea
          id="text-input"
          className="w-full h-32 p-2 border rounded"
          value={text}
          onChange={handleTextChange}
          placeholder="Enter your text here..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file-upload">Or upload a text file:</Label>
        <Input id="file-upload" type="file" accept=".txt,.pdf" onChange={handleFileUpload} />
      </div>

      <div 
        ref={typingRef}
        className="w-full h-64 p-4 border rounded overflow-auto focus:outline-none"
        tabIndex={0}
        onKeyDown={handleTyping}
      >
        {text.split('').map((char, index) => (
          <span key={index} className={index < typedText.length ? 'bg-primary text-primary-foreground' : ''}>
            {char}
          </span>
        ))}
      </div>

      <div className="flex items-center space-x-4">
        <Button onClick={togglePlayPause}>
          {speaking ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {speaking ? 'Pause' : 'Play'}
        </Button>
        
        <div className="flex items-center space-x-2">
          <Volume2 className="h-4 w-4" />
          <Slider
            value={[volume]}
            onValueChange={(value) => setVolume(value[0])}
            max={1}
            step={0.1}
            className="w-24"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="sync-switch">Sync with typing</Label>
          <Switch
            id="sync-switch"
            checked={syncWithTyping}
            onCheckedChange={setSyncWithTyping}
          />
        </div>
      </div>
    </div>
  )
}

export default MultiSenseLearning