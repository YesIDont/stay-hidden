const draw = {
    segment: function( a, b, color) {
        ctx.strokeStyle = color || '#fff';
        ctx.beginPath();
        ctx.moveTo( a.x, a.y );
        ctx.lineTo( b.x, b.y );
        ctx.stroke();
    },

    circle: function( point, radius ) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
        ctx.fill();
    },
    
    polygon: function( polygon, fillStyle ) {
        ctx.fillStyle = fillStyle;
        ctx.beginPath();
        ctx.moveTo( polygon[0].x, polygon[0].y );
        let i = 1;
        for( i = 1; i < polygon.length; i++ ) {
          let intersect = polygon[i];
          ctx.lineTo( intersect.x, intersect.y );
        }
        ctx.fill();
    }
}
