import React, { useState } from 'react';
import "./addUser.css";
import { db } from '../../../../lib/firebase';
import { 
  collection,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  doc,
  where,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';
import { useUserStore } from '../../../../lib/userStore';

function AddUser() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);  // Declare the error state
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      setError(null); // Reset error before search
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        const foundUser = querySnapShot.docs[0];
        setUser({
          id: foundUser.id,  // Set the user document ID (user.id)
          ...foundUser.data() // Spread the rest of the data
        });
      } else {
        setUser(null);
        setError("User not found");
      }

    } catch (err) {
      console.error(err);
      setError("An error occurred during search");
    }
  };

  const handleAdd = async () => {
    if (!user || !currentUser) {
      console.error("User or current user is not available");
      return;
    }

    try {
      const chatRef = doc(collection(db, "chats")); // Generate new chat document reference

      // Create a new chat document
      await setDoc(chatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const userChatsRef = collection(db, "userchats"); // Define userChatsRef here

      // Fetch Firestore's server timestamp first
      const timestamp = serverTimestamp();

      // Update the chats array for the searched user
      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: chatRef.id,
          lastMessage: "",
          receiverId: currentUser.id, // Current user is the receiver for the searched user
          updatedAt: new Date().toISOString(), // Set a real-time timestamp
        }),
      });

      // Update the chats array for the current user
      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: chatRef.id,
          lastMessage: "",
          receiverId: user.id, // The searched user is the receiver for the current user
          updatedAt: new Date().toISOString(), // Set a real-time timestamp
        }),
      });

    } catch (err) {
      console.error("Error adding chat:", err);
    }
  };

  return (
    <div className='addUser'>
      <form onSubmit={handleSearch}>
        <input type="text" placeholder='Username' name='username' required />
        <button>Search</button>
      </form>

      {/* If an error occurs or no user is found */}
      {error && <p className="error">{error}</p>}

      {/* If a user is found, show user details */}
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="User Avatar" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
}

export default AddUser;
