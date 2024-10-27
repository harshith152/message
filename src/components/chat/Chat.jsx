import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";

const Chat = () => {
    const [chat, setChat] = useState();
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [img, setImg] = useState({
      file:null,
      url:"",  
    });

    const { currentUser } = useUserStore();
    const { chatId, user , isCurrentUserBlocked, isReciverBlocked} = useChatStore();

    const endRef = useRef(null);

    // Scroll to the last message
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat?.messages]);

    // Fetch the chat data
    useEffect(() => {
        if (!chatId) return;

        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            setChat(res.data());
        });

        return () => {
            unSub();
        };
    }, [chatId]);

    const handleEmoji = (e) => {
        setText((prev) => prev + e.emoji);
        setOpen(false);
    };

    const handleImg = (e) => {
        if (e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0]),
            });
        }
    };

    const handleSend = async () => {
        if (text === "") return; // Prevent sending empty messages

        let imgUrl = null

        try {
            if(img.file){
              imgUrl = await upload (img.file);
            }


            // Add the message to Firestore
            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(), // Ensure the field is createdAt
                    ...(imgUrl && {img:imgUrl}),
                }),
            });

            // Update the last message and isSeen status in userchats
            const userIDs = [currentUser.id, user.id];

            userIDs.forEach(async (id) => {
                const userChatsRef = doc(db, "userchats", id);
                const userChatsSnapshot = await getDoc(userChatsRef);

                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();

                    const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);

                    if (chatIndex !== -1) {
                        userChatsData.chats[chatIndex].lastMessage = text;
                        userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
                        userChatsData.chats[chatIndex].updatedAt = new Date(); // Fixed from `updatedatedAt`

                        await updateDoc(userChatsRef, {
                            chats: userChatsData.chats,
                        });
                    }
                }
            });

            setText(""); // Clear the text input after sending the message
        } catch (err) {
            console.log("Error sending message:", err);
        }

        setImg({
            file:null,
            url:""
        })

        setText("");
    };

    return (
        <div className="chat">
            <div className="top">
                <div className="user">
                    <img src= {user?.avatar ||"./avatar.png"} alt="Avatar" />
                    <div className="texts">
                        <span>{user?.username || "Unnamed"}</span>
                        <p>{user?.status || "No status available"}</p>
                    </div>
                </div>
                <div className="icons">
                    <img src="./phone.png" alt="Phone Call" />
                    <img src="./video.png" alt="Video Call" />
                    <img src="./info.png" alt="Info" />
                </div>
            </div>
            <div className="center">
                {chat?.messages?.map((message, index) => (
                    <div className={`message ${message.senderId === currentUser.id ? "own" : ""}`} key={index}>
                        <div className="texts">
                            {message.img && <img src={message.img} alt="Message attachment" />}
                            <p>{message.text}</p>
                        </div>
                    </div>
                ))}

               {img.url && (
                <div className="message own">
                  <div className="texts">
                    <img src={img.url} alt=""/>
                  </div>
                </div>
               )}
                <div ref={endRef}></div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <label htmlFor="file">
                      <img src="./img.png" alt="Upload Image" />
                    </label>
                    <input type="file" id="file" style={{display:"none"}} onChange={handleImg} />
                    <img src="./camera.png" alt="Camera" />
                    <img src="./mic.png" alt="Microphone" />
                </div>
                <input
                    type="text"
                    placeholder={(isCurrentUserBlocked || isReciverBlocked) ? "You cannot send a message ": "Type a message..."}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled= {isCurrentUserBlocked || isReciverBlocked}
                />
                <div className="emoji">
                    <img src="./emoji.png" alt="Emoji Picker" onClick={() => setOpen((prev) => !prev)} />
                    {open && (
                        <div className="picker">
                            <EmojiPicker onEmojiClick={handleEmoji} />
                        </div>
                    )}
                </div>
                <button className="sendButton" onClick={handleSend} disabled= {isCurrentUserBlocked || isReciverBlocked}>Send</button>
            </div>
        </div>
    );
};

export default Chat;
