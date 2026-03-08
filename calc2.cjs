const fs=require("fs");
const content=fs.readFileSync("components/sheets/visual/turkeyMapPaths.ts","utf-8");
const drawMatches=[...content.matchAll(/plate:\s*([\x27"])(.*?)\1[\s\S]*?city:\s*([\x27"])(.*?)\1[\s\S]*?draw:\s*([\x27"])(.*?)\5/g)];
for(const match of drawMatches) {
    const plate = match[2];
    const city = match[4];
    if (["06","34","35","65","07"].includes(plate)) {
        const coords = match[6].match(/[-+]?\d*\.?\d+/g);
        if(!coords) continue;
        let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
        for(let i=0; i<coords.length; i+=2) {
            let x = parseFloat(coords[i]), y = parseFloat(coords[i+1]);
            if (!isNaN(x) && !isNaN(y)) {
                if (x>0 && x<2000) { minX=Math.min(minX,x); maxX=Math.max(maxX,x); }
                if (y>0 && y<1500) { minY=Math.min(minY,y); maxY=Math.max(maxY,y); }
            }
        }
        let cx = (minX+maxX)/2;
        let cy = (minY+maxY)/2;
        console.log(`Plate ${plate} (${city}): Center (${cx.toFixed(1)}, ${cy.toFixed(1)}) | Ranges X:[${minX.toFixed(1)}, ${maxX.toFixed(1)}] Y:[${minY.toFixed(1)}, ${maxY.toFixed(1)}]`);
    }
}
