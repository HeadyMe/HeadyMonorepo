"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const client_1 = __importDefault(require("react-dom/client"));
const SplitPane_1 = __importDefault(require("./components/SplitPane"));
require("./index.css");
const App = () => (<SplitPane_1.default left={<div>Task Queue</div>} right={<div>Context Dashboard</div>}/>);
client_1.default.createRoot(document.getElementById('root')).render(<App />);
//# sourceMappingURL=main.js.map