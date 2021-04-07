import { html, TemplateResult } from 'lit-html';
import '../src/lexml-eta.js';

export default {
  title: 'LexmlEta',
  component: 'lexml-eta',
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

interface Story<T> {
  (args: T): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes {
  title?: string;
  backgroundColor?: string;
}

const Template: Story<ArgTypes> = ({ title, backgroundColor = 'white' }: ArgTypes) => html`
  <lexml-eta style="--lexml-eta-background-color: ${backgroundColor}" .title=${title}></lexml-eta>
`;

export const App = Template.bind({});
App.args = {
  title: 'My app',
};
