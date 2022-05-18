'use strict';

export function GetUI()
{
  const get = (query, element = document) =>
  {
    return element.querySelector(query);
  };
  const statusBar = get('.status-bar');
  const youDiedScreen = get('.you-died');
  const restartButton = get('.you-died .restart-button');
  const debugDrawSwitch = get('.status-debug input');
  const showBHVSwitch = get('.status-bvh input');

  restartButton.addEventListener
  ('click', () =>
  {
    window.location.reload();
  }
  );

  return {
    statusBar,
    debugDrawSwitch,
    showBHVSwitch,
    youDiedScreen,
  };
};

