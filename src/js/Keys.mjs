'use strict';

const KeysBindings = {
  up: 'w',
  down: 's',
  left: 'a',
  right: 'd',
  sprint: 'shift',
  flashlightSwitch: 'f',
};

const Keys = {};
Keys[ KeysBindings.up ] = false;
Keys[ KeysBindings.down ] = false;
Keys[ KeysBindings.left ] = false;
Keys[ KeysBindings.right ] = false;
Keys[ KeysBindings.sprint ] = false;
Keys[ KeysBindings.flashlightSwitch ] = false;

function onKeyDown({ key })
{
  Keys[ key.toLowerCase() ] = true;
}

function onKeyUp({ key })
{
  Keys[ key.toLowerCase() ] = false;
}

window.addEventListener( 'keydown', onKeyDown );
window.addEventListener( 'keyup', onKeyUp );

export { KeysBindings, Keys };

