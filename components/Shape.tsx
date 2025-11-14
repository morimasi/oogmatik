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
        case 'cube':
            return <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="5"><path d="M25 35 V75 L50 90 L75 75 V35 L50 20 Z M25 35 L50 20 L75 35 M50 90 V55 L25 75 M75 75 L50 55"/></svg>;
        case 'sphere':
             return <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="5"><circle cx="50" cy="50" r="40"/><ellipse cx="50" cy="50" rx="20" ry="40"/></svg>;
        case 'pyramid':
            return <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="5"><path d="M50 10 L10 90 H90 Z M50 10 L50 90 M10 90 L50 50 L90 90"/></svg>;
        case 'cone':
            return <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="5"><path d="M50 10 L10 90 H90 Z"/><ellipse cx="50" cy="90" rx="40" ry="8"/></svg>;
        default:
            return null;
    }
};

export default Shape;