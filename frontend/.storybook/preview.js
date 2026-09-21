// @ts-check
import '../src/assets/scss/custom.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0b0f19' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
};

export default preview;
