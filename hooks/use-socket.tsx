"use client"

import { useEffect, useState } from "react"
import type { Socket } from "socket.io-client"

export function useSocket(roomCode: string) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // In a real app, this would connect to your actual Socket.IO server
    // For this demo, we'll simulate socket behavior with improved persistence

    // Check if we already have a socket instance for this room
    const existingSocketKey = `socket-${roomCode}`
    let socketId = localStorage.getItem(existingSocketKey)

    if (!socketId) {
      socketId = `socket-${Math.random().toString(36).substring(2, 9)}`
      localStorage.setItem(existingSocketKey, socketId)
    }

    const socketInstance = {
      id: socketId,
      connected: false,
      roomCode: roomCode,

      // Event listeners
      listeners: new Map<string, Function[]>(),

      // Connect method
      connect: function () {
        this.connected = true

        // Call any connect listeners
        const connectListeners = this.listeners.get("connect") || []
        connectListeners.forEach((callback) => callback())

        return this
      },

      // Disconnect method
      disconnect: function () {
        this.connected = false

        // Call any disconnect listeners
        const disconnectListeners = this.listeners.get("disconnect") || []
        disconnectListeners.forEach((callback) => callback())

        return this
      },

      // Emit method
      emit: function (event: string, ...args: any[]) {
        console.log(`[Socket] Emitting ${event}`, args)

        // Store events in localStorage to simulate server persistence
        if (event === "gameState" || event === "sendMessage") {
          const eventData = {
            event,
            data: args,
            timestamp: Date.now(),
            roomCode: this.roomCode,
          }

          // Store last 20 events
          const eventsKey = `events-${this.roomCode}`
          const storedEvents = JSON.parse(localStorage.getItem(eventsKey) || "[]")
          storedEvents.push(eventData)
          if (storedEvents.length > 20) storedEvents.shift()
          localStorage.setItem(eventsKey, JSON.stringify(storedEvents))

          // Simulate broadcasting to other tabs/windows
          window.dispatchEvent(new CustomEvent("socket-event", { detail: eventData }))
        }

        // Simulate server response for certain events
        if (event === "joinRoom") {
          setTimeout(() => {
            const callbacks = this.listeners.get("roomJoined") || []
            callbacks.forEach((callback) => callback(args[0]))

            // Also trigger playerJoined for other "connected" sockets
            const playerJoinedCallbacks = this.listeners.get("playerJoined") || []
            if (playerJoinedCallbacks.length) {
              playerJoinedCallbacks.forEach((callback) =>
                callback({
                  id: this.id,
                  name: args[0].player.name,
                  avatarId: args[0].player.avatarId,
                  symbol: args[0].player.isHost ? "X" : "O",
                }),
              )
            }
          }, 500)
        }

        return this
      },

      // On method
      on: function (event: string, callback: Function) {
        if (!this.listeners.has(event)) {
          this.listeners.set(event, [])
        }
        this.listeners.get(event)?.push(callback)
        return this
      },

      // Off method
      off: function (event: string, callback?: Function) {
        if (callback) {
          const callbacks = this.listeners.get(event) || []
          const index = callbacks.indexOf(callback)
          if (index !== -1) {
            callbacks.splice(index, 1)
          }
        } else {
          this.listeners.delete(event)
        }
        return this
      },
    } as unknown as Socket

    // Set up event listener for cross-tab communication with debounce
    let lastEventTimestamp = 0
    const DEBOUNCE_TIME = 100 // ms

    const handleSocketEvent = (e: CustomEvent) => {
      const eventData = e.detail
      const now = Date.now()

      // Only process events for this room
      if (eventData.roomCode !== roomCode) return

      // Debounce events to prevent rapid updates
      if (now - lastEventTimestamp < DEBOUNCE_TIME) return
      lastEventTimestamp = now

      // Process the event
      if (eventData.event === "gameState") {
        const callbacks = socketInstance.listeners.get("gameState") || []
        callbacks.forEach((callback) => callback(eventData.data[0]))
      }

      if (eventData.event === "sendMessage") {
        const callbacks = socketInstance.listeners.get("chatMessage") || []
        callbacks.forEach((callback) => callback(eventData.data[0].message))
      }
    }

    window.addEventListener("socket-event", handleSocketEvent as EventListener)

    // Connect the socket
    socketInstance.connect()
    setSocket(socketInstance)
    setIsConnected(true)

    // Process any stored events
    const eventsKey = `events-${roomCode}`
    const storedEvents = JSON.parse(localStorage.getItem(eventsKey) || "[]")

    // Process the most recent gameState event if it exists
    const lastGameState = storedEvents
      .filter((e) => e.event === "gameState")
      .sort((a, b) => b.timestamp - a.timestamp)[0]

    if (lastGameState) {
      setTimeout(() => {
        const callbacks = socketInstance.listeners.get("gameState") || []
        callbacks.forEach((callback) => callback(lastGameState.data[0]))
      }, 800)
    }

    // Clean up on unmount
    return () => {
      socketInstance.disconnect()
      setSocket(null)
      setIsConnected(false)
      window.removeEventListener("socket-event", handleSocketEvent as EventListener)
    }
  }, [roomCode])

  return { socket, isConnected }
}
