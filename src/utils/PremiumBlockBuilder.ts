// Lightweight chainable builder for premium content blocks
// Designed to fix intermediate-value chaining issues and provide a predictable API

export type RiddleClue = { id: string; text: string; type?: string };
export type Riddle = { id: string; mysteryNumber: number; clues?: RiddleClue[] };

export interface PremiumContentBlock {
  header?: string;
  instruction?: string;
  pedagogicalNote?: string;
  riddles?: Riddle[];
  // allow arbitrary settings for future extensibility
  [key: string]: any;
}

export class PremiumBlockBuilder {
  private content: PremiumContentBlock = {};

  addPremiumHeader(header: string): this {
    this.content.header = header;
    return this;
  }

  setInstruction(instruction: string): this {
    this.content.instruction = instruction;
    return this;
  }

  addPedagogicalNote(note: string): this {
    this.content.pedagogicalNote = note;
    return this;
  }

  addRiddle(riddle: { id: string; mysteryNumber: number; clues?: RiddleClue[] }): this {
    if (!this.content.riddles) this.content.riddles = [];
    this.content.riddles.push(riddle as Riddle);
    return this;
  }

  // Allows composing arbitrary content blocks when needed
  set(key: string, value: any): this {
    this.content[key] = value;
    return this;
  }

  build(): PremiumContentBlock {
    return this.content;
  }
}

export default PremiumBlockBuilder;
