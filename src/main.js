import './style.css';
import { buildHeader } from './components/header.js';
import { buildFooter } from './components/footer.js';

document.body.prepend(buildHeader());
document.body.append(buildFooter());
