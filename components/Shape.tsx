import React from 'react';
import { ShapeType } from '../types';

interface ShapeProps {
    name: ShapeType;
    className?: string;
}

const Shape: React.FC<ShapeProps> = ({ name, className = "w-10 h-10" }) => {
    switch (name) {
        case 'circle':
            return <svg viewBox="0 0 100 100" className={className} fill="currentColor"><circle cx="50" cy="50" r="45" stroke="black" strokeWidth="5" /></svg>;
        case 'square':
            return <svg viewBox="0 0 100 100" className={className} fill="currentColor"><rect x="5" y="5" width="90" height="90" stroke="black" strokeWidth="5" /></svg>;
        case 'triangle':
            return <svg viewBox="0 0 100 100" className={className} fill="currentColor"><polygon points="50,5 95,95 5,95" stroke="black" strokeWidth="5" /></svg>;
        case 'hexagon':
            return <svg viewBox="0 0 100 100" className={className} fill="currentColor"><polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="black" strokeWidth="5" /></svg>;
        case 'star':
            return <svg viewBox="0 0 100 100" className={className} fill="currentColor"><polygon points="50,5 61,40 98,40 68,62 79,96 50,75 21,96 32,62 2,40 39,40" stroke="black" strokeWidth="5" /></svg>;
        case 'diamond':
            return <svg viewBox="0 0 100 100" className={className} fill="currentColor"><polygon points="50,5 95,50 50,95 5,50" stroke="black" strokeWidth="5" /></svg>;
        case 'pentagon':
             return <svg viewBox="0 0 100 100" className={className} fill="currentColor"><polygon points="50,5 95,40 78,95 22,95 5,40" stroke="black" strokeWidth="5" /></svg>;
        case 'octagon':
            return <svg viewBox="0 0 100 100" className={className} fill="currentColor"><polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" stroke="black" strokeWidth="5" /></svg>;
        default:
            return null;
    }
};

export default Shape;
