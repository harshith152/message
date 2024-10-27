import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore"; // Added `updateDoc`
import { useUserStore } from "../../../lib/userStore";
import AddUser from "./addUser/AddUser";
import "./chatList.css";
import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";

const Chatlist = () => {
  const [chats, setChats] = useState([]); // Initialize as an empty array
  const [addMode, setAddMode] = useState(false);

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    if (!currentUser?.id) return; // Ensure currentUser and currentUser.id exist

    const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      const items = res.data()?.chats || []; // Ensure chats exist
      const promises = items.map(async (item) => {
        // Fix typo in receiverId
        const userDocRef = doc(db, "users", item.receiverId); // Use "receiverId"
        const userDocSnap = await getDoc(userDocRef);

        const user = userDocSnap.exists() ? userDocSnap.data() : null;

        return { ...item, user };
      });

      const chatData = await Promise.all(promises);

      // Ensure updatedAt is present and compare it for sorting
      setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
    });

    return () => {
      unSub();
    };
  }, [currentUser?.id]);

  const handleSelect = async (selectedChat) => {
    const updatedChats = chats.map((chatItem) => {
      // Directly update the selected chat's isSeen property
      if (chatItem.chatId === selectedChat.chatId) {
        return { ...chatItem, isSeen: true };
      }
      return chatItem;
    });

    const userChatsRef = doc(db, "userchats", currentUser.id); // Get reference to user chats

    try {
      // Update Firestore with the modified chats array
      await updateDoc(userChatsRef, {
        chats: updatedChats,
      });
      // Change the chat in the global chat store
      changeChat(selectedChat.chatId, selectedChat.user);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="/search.png" alt="" />
          <input type="text" placeholder="Search" />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>

      {/* Render chats only if they exist */}
      {chats.length > 0 ? (
        chats.map((chat) => (
          <div
            className="item"
            key={chat.chatId}
            onClick={() => handleSelect(chat)}
            style={{
              backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
            }}
          >
            <img src={chat.user?.avatar || "./avatar.png"} alt="" />
            <div className="text">
              <span>{chat.user?.username || "Unnamed"}</span>
              <p>{chat.lastMessage}</p>
            </div>
          </div>
        ))
      ) : (
        <p>No chats available</p>
      )}

      {/* Render AddUser component when in addMode */}
      {addMode && <AddUser />}
    </div>
  );
};

export default Chatlist;
