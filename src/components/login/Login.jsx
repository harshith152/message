import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { setDoc, doc } from "firebase/firestore";
import upload from "../../lib/upload"; // Assuming you have a separate upload function for avatar

const Login = () => {
    const [avatar, setAvatar] = useState({
        file: null,
        url: ''
    });

    const [loading,setLoading] = useState(false)

    // Handle Avatar upload
    const handleAvatar = (e) => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0]),
            });
        }
    };

    // Handle Login
    const handleLogin = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);
        
        if (!email || !password) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Successfully logged in!");
        } catch (err) {
            console.error("Login error:", err);
            toast.error(err.message);
        } finally{
            setLoading(false);
        }
    };

    // Handle Register
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true)
        const formData = new FormData(e.target);
        const { username, email, password } = Object.fromEntries(formData);
        
        if (!username || !email || !password) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            // Create user with email and password
            const res = await createUserWithEmailAndPassword(auth, email, password);

            // Upload the avatar if present
            const imgUrl = avatar.file ? await upload(avatar.file) : "";

            // Save user info in Firestore
            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                id: res.user.uid,
                avatar: imgUrl, // Save avatar URL
                blocked: [],
            });

            // Save empty user chats
            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: [],
            });

            toast.success("Account created! Please log in.");
        } catch (err) {
            console.error("Error during registration:", err);
            toast.error(err.message);
        } finally{
            setLoading(false);
        }
    };

    return (
        <div className="login">
            <div className="item">
                <h2>Welcome</h2>
                <form onSubmit={handleLogin}>
                    <input type="email" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />
                    <button disabled = {loading}>{loading ?"Loading":"Sign In"}</button>
                </form>
            </div>
            <div className="separator"></div>
            <div className="item">
                <h2>Create an Account</h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor="file">
                        <img src={avatar.url || './avatar.png'} alt="Profile" />
                        Upload a profile picture
                    </label>
                    <input type="file" id="file" style={{ display: 'none' }} onChange={handleAvatar} />
                    <input type="text" placeholder="Username" name="username" />
                    <input type="email" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />
                    <button disabled = {loading}>{loading ?"Loading":"Sign up"}</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
