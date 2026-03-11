import fs from "fs";
import { turkeyMapPaths } from "./components/sheets/visual/turkeyMapPaths.ts";

let cities = {};
for (const item of turkeyMapPaths) {
    const coords = item.draw.match(/[-+]?\d*\.?\d+/g);
    if (!coords) continue;
    let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
    // VERY simple parse: just assume any number is a coordinate if it is absolute. 
    // Actually, SVG paths have relative commands like "m 10,20 l -5,6". It is hard to parse accurately without an SVG library.
    // Let us use "svg-path-parser" or similar.
}

