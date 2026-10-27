globalThis.app ||= {};
app.hot = module.hot;
app.hash = () => __webpack_hash__;
app.load = require('./bridge');
