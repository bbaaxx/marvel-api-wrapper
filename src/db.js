import persist from 'node-persist';
export default callback => {
  persist.init().then(instance => callback(persist));
};
