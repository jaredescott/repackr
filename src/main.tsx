import ReactDOM from 'react-dom/client'
import App from './App'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import { completeRedirectSignIn } from './lib/firebase';

/** Resume Google redirect sign-in (github.io). */
void completeRedirectSignIn();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <CssBaseline />
    <App />
  </>
);
