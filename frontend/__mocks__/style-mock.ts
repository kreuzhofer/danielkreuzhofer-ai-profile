// CSS imports are a no-op in the Jest/jsdom test environment.
// Components rely on CSS custom properties (--sc-*) at runtime; tests verify DOM structure only.
const styleMock = {};
export default styleMock;
