import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import 'terra-base/lib/baseStyles';
import styles from './SectionHeader.scss';

const cx = classNames.bind(styles);

const propTypes = {
  /**
   * Text to be displayed on the SectionHeader.
   */
  title: PropTypes.node.isRequired,
  /**
   * Whether the change between 'open' and' closed' position of the accordion icon is animated.
   */
  isAnimated: PropTypes.bool,
  /**
   * Callback function triggered when the accordion icon is clicked.
   */
  onClick: PropTypes.func,
  /**
   * Whether the accordion icon should be displayed in its 'open' or 'closed' position.
   */
  isOpen: PropTypes.bool,
};

const defaultProps = {
  isAnimated: false,
  onClick: undefined,
  isOpen: false,
};

const SectionHeader = ({
  title,
  isAnimated,
  onClick,
  isOpen,
  ...customProps
}) => {
  if (!onClick && (isAnimated || isOpen)) {
    /* eslint-disable no-console */
    console.warn('\'isAnimated\' & \'isOpen\' are intended to be used only when \'onClick\' is provided.');
  }

  const attributes = Object.assign({}, customProps);

  if (onClick) {
    attributes.tabIndex = '0';
  }

  const glyphClassNames = cx([
    'glyph',
    { 'is-animated': onClick && isAnimated },
    { 'is-open': onClick && isOpen },
  ]);

  const accordionGlyph = (
    <span className={glyphClassNames}>
      <svg className={cx('accordion-glyph')} />
    </span>
  );

  const SectionHeaderClassNames = cx([
    'section-header',
    { 'is-interactable': onClick },
    customProps.className,
  ]);

  /* eslint-disable jsx-a11y/no-static-element-interactions */
  return (
    <div {...attributes} onClick={onClick} className={SectionHeaderClassNames}>
      {onClick && accordionGlyph}
      <span className={cx('title')}>{title}</span>
    </div>
  );
};

SectionHeader.propTypes = propTypes;
SectionHeader.defaultProps = defaultProps;

export default SectionHeader;
