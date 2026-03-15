'use client';
import React, { useState } from 'react';
import { DragDropQuestion as DragDropQuestionType } from '../../../types/schemas';
import { DyslexicText } from '../../atoms/DyslexicText';
import { HintButton } from '../../molecules/HintButton';
import { CheckCircle2, XCircle, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  content: string;
  isSubmitted: boolean;
  isCorrect?: boolean;
}

const SortableItem = ({ id, content, isSubmitted, isCorrect }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: isSubmitted,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  let stateClass = 'bg-white border-gray-200 text-gray-800';
  if (isDragging) {
    stateClass = 'bg-indigo-50 border-indigo-400 shadow-xl scale-105 z-50 text-indigo-900';
  } else if (isSubmitted) {
    if (isCorrect) {
      stateClass = 'bg-green-50 border-green-500 text-green-900';
    } else {
      stateClass = 'bg-red-50 border-red-500 text-red-900';
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center p-4 mb-3 rounded-2xl border-2 shadow-sm transition-colors duration-200 ${stateClass}`}
      {...attributes}
      {...listeners}
    >
      <div
        className={`mr-4 cursor-grab ${isSubmitted ? 'opacity-50 cursor-not-allowed' : 'text-gray-400 hover:text-indigo-500'}`}
      >
        <GripVertical size={24} />
      </div>
      <div className="flex-1 text-xl font-medium">
        <DyslexicText text={content} />
      </div>
      {isSubmitted && (
        <div className="ml-4 shrink-0">
          {isCorrect ? (
            <CheckCircle2 size={24} className="text-green-600" />
          ) : (
            <XCircle size={24} className="text-red-600" />
          )}
        </div>
      )}
    </div>
  );
};

interface DragDropQuestionProps {
  question: DragDropQuestionType;
  onAnswer?: (isCorrect: boolean, orderedIds: string[]) => void;
}

export const DragDropQuestion: React.FC<DragDropQuestionProps> = ({ question, onAnswer }) => {
  const [items, setItems] = useState(() => {
    // Randomize initial order to ensure it's not already correct
    const shuffled = [...question.items].sort(() => Math.random() - 0.5);
    return shuffled;
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = () => {
    let allCorrect = true;
    const newResults: Record<string, boolean> = {};

    items.forEach((item, index) => {
      // Assuming 1-indexed or 0-indexed correctOrder in data
      // We will check if the current index matches the correctOrder - 1 (assuming correctOrder is 1,2,3)
      const isItemCorrect = item.correctOrder === index + 1;
      newResults[item.id] = isItemCorrect;
      if (!isItemCorrect) allCorrect = false;
    });

    setResults(newResults);
    setIsSubmitted(true);
    if (onAnswer) {
      onAnswer(
        allCorrect,
        items.map((i) => i.id)
      );
    }
  };

  const isAllCorrect = Object.values(results).every((v) => v === true);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-indigo-50">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm font-bold mb-3">
            Sıralama (Sürükle Bırak)
          </span>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            <DyslexicText text={question.instruction} />
          </h3>
        </div>
        <HintButton hint={question.feedback.incorrect} />
      </div>

      <div className="mb-8">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item) => (
              <SortableItem
                key={item.id}
                id={item.id}
                content={item.content}
                isSubmitted={isSubmitted}
                isCorrect={results[item.id]}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {!isSubmitted ? (
        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-2xl bg-indigo-600 text-white text-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Sıralamayı Kontrol Et
        </button>
      ) : (
        <div
          className={`p-5 rounded-2xl border-2 flex gap-4 items-start ${isAllCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
        >
          {isAllCorrect ? (
            <CheckCircle2 size={32} className="text-green-600 shrink-0" />
          ) : (
            <XCircle size={32} className="text-red-600 shrink-0" />
          )}
          <div>
            <h4
              className={`text-xl font-bold mb-1 ${isAllCorrect ? 'text-green-800' : 'text-red-800'}`}
            >
              {isAllCorrect ? 'Harika Sıralama!' : 'Sıralamada Hatalar Var'}
            </h4>
            <p
              className={`text-lg font-medium ${isAllCorrect ? 'text-green-700' : 'text-red-700'}`}
            >
              {isAllCorrect ? question.feedback.correct : question.feedback.incorrect}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
