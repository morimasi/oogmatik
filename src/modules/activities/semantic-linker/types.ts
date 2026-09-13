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

}


export interface SemanticLinkerData {
  title?: string;
  instruction: string;
  items: SemanticLinkerItem[];
  pedagogicalNote?: string;
  difficulty?: string;
}
