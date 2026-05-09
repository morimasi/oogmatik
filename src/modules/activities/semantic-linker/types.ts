export interface SemanticLinkerOption {
  id: string;
  label: string;
  imageUrl?: string;
  isCorrect: boolean;
}

export interface SemanticLinkerItem {
  id: string;
  targetWord: string;
  isNegated: boolean;
  options: SemanticLinkerOption[];
  correctAnswerId: string;
  pedagogicalNote?: string;
}


export interface SemanticLinkerData {
  instruction: string;
  items: SemanticLinkerItem[];
}
