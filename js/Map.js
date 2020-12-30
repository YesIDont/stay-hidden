"use strict";

const poly1 = [
    {a:{x:100,y:150}, b:{x:120,y:50}},
    {a:{x:120,y:50}, b:{x:200,y:80}},
    {a:{x:200,y:80}, b:{x:140,y:210}},
    {a:{x:140,y:210}, b:{x:100,y:150}},
]

const poly2 = [
    {a:{x:100,y:200}, b:{x:120,y:250}},
    {a:{x:120,y:250}, b:{x:60,y:300}},
    {a:{x:60,y:300}, b:{x:100,y:200}},
]

const poly3 = [
    {a:{x:200,y:260}, b:{x:220,y:150}},
    {a:{x:220,y:150}, b:{x:300,y:200}},
    {a:{x:300,y:200}, b:{x:350,y:320}},
    {a:{x:350,y:320}, b:{x:200,y:260}},
]

const poly4 = [
    {a:{x:340,y:60}, b:{x:360,y:40}},
    {a:{x:360,y:40}, b:{x:370,y:70}},
    {a:{x:370,y:70}, b:{x:340,y:60}},
]

const poly5 = [
    {a:{x:450,y:190}, b:{x:560,y:170}},
    {a:{x:560,y:170}, b:{x:540,y:270}},
    {a:{x:540,y:270}, b:{x:430,y:290}},
    {a:{x:430,y:290}, b:{x:450,y:190}},
]

const poly6 = [
    {a:{x:400,y:95}, b:{x:580,y:50}},
    {a:{x:580,y:50}, b:{x:480,y:150}},
    {a:{x:480,y:150}, b:{x:400,y:95}}
]

const mapData = [
    poly1,
    poly2,
    poly3,
    poly4,
    poly5,
    poly6,
];

// copy mapData with x and y offset
[[500, 0], [1000, 0], [50, 250], [0, 500]].forEach(offset => {
    mapData.forEach(poly => {
        const newPoly = poly.map(item => {
            return {
                a: {
                    x: item.a.x + offset[0],
                    y: item.a.y + offset[1],
                },
                b: {
                    x: item.b.x + offset[0],
                    y: item.b.y + offset[1],
                },
            }
        });
        mapData.push(newPoly);
    });
});
