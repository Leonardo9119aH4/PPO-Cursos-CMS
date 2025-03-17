import { createRoot } from 'react-dom/client'
import MainRoutes from './router'
import { BrowserRouter } from 'react-router'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <MainRoutes />
  </BrowserRouter>,
)
