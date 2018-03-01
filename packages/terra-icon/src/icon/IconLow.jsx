/* eslint-disable */
import React from 'react';
import IconBase from '../IconBase';

const SvgIcon = (customProps) => {
  const attributes = Object.assign({}, customProps);

  return (
    <IconBase {...attributes}>
      <style ></style><path className="st0" d="M.3 24.8l22.9 22.9c.2.2.5.3.8.3s.6-.1.8-.3l22.9-22.9c.4-.4.4-1.1 0-1.6L24.8.3c-.2-.2-.5-.3-.8-.3s-.6.1-.8.3L.3 23.2c-.4.4-.4 1.2 0 1.6zm.7-.9L23.9 1h.2L47 23.9v.2L24.1 47h-.2L1 24.1v-.2zM24 39l11-11h-8V9h-6v19h-8l11 11z" ></path>
    </IconBase>
  );
};

SvgIcon.displayName = "IconLow";
SvgIcon.defaultProps = {"viewBox":"0 0 48 48","xmlns":"http://www.w3.org/2000/svg","id":"Layer_1"};

export default SvgIcon;
/* eslint-enable */
