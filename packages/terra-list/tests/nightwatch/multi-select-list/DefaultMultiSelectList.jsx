import React from 'react';

import MultiSelectList from '../../../lib/MultiSelectList';

const list = () => (
  <MultiSelectList id="example-list">
    <MultiSelectList.Item content={<p>test 1</p>} key="123" />
    <MultiSelectList.Item content={<p>test 2</p>} key="124" />
    <MultiSelectList.Item content={<p>test 3</p>} key="125" />
  </MultiSelectList>
 );

export default list;
