import React from 'react';

import SectionHeaderExampleTemplate from './SectionHeaderExampleTemplate';


class AnimatedSectionHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = { isOpen: false };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  }

  render() {
    const sectionHeaderProps = {
      title: 'I can accordion with animation, click me',
      isOpen: this.state.isOpen,
      onClick: this.handleClick,
      isAnimated: true,
    };

    return (
      <SectionHeaderExampleTemplate title="Accordion Section Header" exampleProps={sectionHeaderProps} />
    );
  }
}

export default AnimatedSectionHeader;
