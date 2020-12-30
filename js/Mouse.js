"use strict";

(function() {

    const Mouse = {
        x: 0,
        y: 0,

        getMouseToPointAngle( point ) {
            const { x, y } = point;

            return Math.atan2( this.x - x, y - this.y );
        }
    };
    
    function getmousePosition( e )
    {
        let v = e || window.event;
        let x = v.pageX;
        let y = v.pageY;

        // IE 8
        if ( x === undefined || x === null ) {
            const { scrollLeft, scrollTop } = document.body
            const { documentElement } = document
            x = v.clientX + scrollLeft + documentElement.scrollLeft;
            y = v.clientY + scrollTop + documentElement.scrollTop;
        }

        Mouse.x = x;
        Mouse.y = y;
    };

    document.addEventListener( 'mousemove', getmousePosition );

    Engine.Mouse = Mouse;

})();
