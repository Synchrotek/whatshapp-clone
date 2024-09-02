import { useState } from "react";
import { toast } from 'react-hot-toast';

const Login = () => {
    // required states --------------------------------------------------------
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // util functions ----------------------------------------------------------
    const toggleLogin = () => {
        setIsLogin(prevIsLogin => !prevIsLogin);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (email === '' || password === '') {
            toast.error("Please provide all values.")
        }
    }
    const handleSignup = (e) => {
        e.preventDefault();
        if (name === '', bio === '' ||
            email === '' || password === '') {
            toast.error("Please provide all values.")
        }
    }

    // JSX part ----------------------------------------------------------------
    const LoginForm = () => <form className="flex flex-col gap-4"
        onSubmit={handleLogin}
    >
        <input type="email"
            className="input text-black bg-slate-400 placeholder-black focus-within:outline-none"
            placeholder="Enter email"
            value={email}
            onChange={e => setEmail(e.target.value)}
        />
        <input type="password"
            className="input text-black bg-slate-400 placeholder-black focus-within:outline-none"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
        />
        <button
            type="submit"
            className="btn btn-success"
        >Login</button>
    </form>

    const RegisterForm = () => <form className="flex flex-col gap-4"
        onSubmit={handleSignup}
    >
        <input type="text"
            className="input text-black bg-slate-400 placeholder-black focus-within:outline-none"
            placeholder="Your Name"
            value={name}
            onChange={e => setName(e.target.value)}
        />
        <input type="text"
            className="input text-black bg-slate-400 placeholder-black focus-within:outline-none"
            placeholder="Bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
        />
        <input type="email"
            className="input text-black bg-slate-400 placeholder-black focus-within:outline-none"
            placeholder="Enter email"
            value={email}
            onChange={e => setEmail(e.target.value)}
        />
        <input type="password"
            className="input text-black bg-slate-400 placeholder-black focus-within:outline-none"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
        />
        <button
            type="submit"
            className="btn btn-success"
        >Register</button>
    </form>

    return <div className="p-4 flex flex-col items-center justify-center h-screen">
        <p className="text-xl my-4 border-b-[1px] font-bold px-6">
            {isLogin ? 'Login' : 'Register'}
        </p>
        {isLogin ? <LoginForm /> : <RegisterForm />}
        <button className="my-3 hover:underline"
            onClick={toggleLogin}
        >
            {isLogin ? "Don't have an account?" : "Already have an account?"}
        </button>
    </div>;
}

export default Login