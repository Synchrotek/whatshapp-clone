import { lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectRoute from './components/auth/ProtectRoute';
import NotFound from './pages/NotFound';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Chat = lazy(() => import('./pages/Chat'));
const Groups = lazy(() => import('./pages/Groups'));

let user = true;

function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path='/' element={<ProtectRoute user={user} />}>
          <Route path='/' element={<Home />} />
          <Route path='/chat/:chatId' element={<Chat />} />
          <Route path='/groups' element={<Groups />} />
        </Route>

        <Route path='/login' element={
          <ProtectRoute user={!user} redirect='/'>
            <Login />
          </ProtectRoute>
        } />

        <Route path='*' element={<NotFound />} />
      </Routes>

      <Toaster
        position="top-right"
        reverseOrder={false}
      />

    </BrowserRouter>
  )
}

export default App
