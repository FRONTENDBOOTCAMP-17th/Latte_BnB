import { buildHeader } from '../src/components/header.js';
import { buildFooter } from '../src/components/footer.js';

document.body.prepend(buildHeader());
document.body.append(buildFooter());
