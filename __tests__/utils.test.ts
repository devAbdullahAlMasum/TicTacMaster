import { describe, it, expect } from 'vitest'
import { cn, generateRoomCode } from '../lib/utils'

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3')
    })

    it('should handle undefined and null', () => {
      expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2')
    })
  })

  describe('generateRoomCode', () => {
    it('should generate a 6-character room code', () => {
      const code = generateRoomCode()
      expect(code).toHaveLength(6)
    })

    it('should generate different codes on multiple calls', () => {
      const code1 = generateRoomCode()
      const code2 = generateRoomCode()
      expect(code1).not.toBe(code2)
    })

    it('should only contain uppercase letters and numbers', () => {
      const code = generateRoomCode()
      expect(code).toMatch(/^[A-Z0-9]{6}$/)
    })
  })
})