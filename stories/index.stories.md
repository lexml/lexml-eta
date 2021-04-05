```js script
import { html } from '@open-wc/demoing-storybook';
import '../dist/lexml-eta.js';

export default {
  title: 'LexmlEta',
  component: 'lexml-eta',
  options: { selectedPanel: "storybookjs/knobs/panel" },
};
```

# LexmlEta

A component for...

## Features:

- a
- b
- ...

## How to use

### Installation

```bash
yarn add lexml-eta
```

```js
import 'lexml-eta/lexml-eta.js';
```

```js preview-story
export const Simple = () => html`
  <lexml-eta></lexml-eta>
`;
```

## Variations

###### Custom Title

```js preview-story
export const CustomTitle = () => html`
  <lexml-eta title="Hello World"></lexml-eta>
`;
```
