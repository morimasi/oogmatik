import { turkeyMapPaths } from "./turkeyMapPaths.js";

const points = [
    { plate: "22", name: "Edirne" },
    { plate: "34", name: "Istanbul" },
    { plate: "35", name: "Izmir" },
    { plate: "06", name: "Ankara" },
    { plate: "65", name: "Van" }
];

points.forEach(p => {
    const item = turkeyMapPaths.find(t => t.plate === p.plate);
    if(item) {
        const coords = item.draw.match(/[-+]?\d*\.?\d+/g);
        let minX = 9999, minY = 9999, maxX = -9999, maxY = -9999;
        // We cannot parse paths without logic correctly.
        // But if we just look at absolute M and L commands, we can estimate!
        const absMatches = item.draw.match(/[ML][^MLmlhvcz]+/g);
        if (absMatches) {
            absMatches.forEach(m => {
                const nums = m.match(/[-+]?\d*\.?\d+/g);
                if (nums && nums.length >= 2) {
                    const x = parseFloat(nums[0]);
                    const y = parseFloat(nums[1]);
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            });
            console.log(p.name + " BBox:", minX, minY, maxX, maxY);
        }
    }
});

