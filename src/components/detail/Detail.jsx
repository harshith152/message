import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import { useChatStore } from "../../lib/chatStore"; // Import useChatStore
import "./detail.css";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReciverBlocked, changeBlock } = useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user || !currentUser) return;

    const userDocRef = doc(db, "users", currentUser.id); // Fixed collection name to "users"

    try {
      await updateDoc(userDocRef, {
        // Toggle block/unblock: If receiver is blocked, remove them, otherwise add them
        blocked: isReciverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock(chatId, !isReciverBlocked); // Trigger the block change
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="User Avatar" />
        <h2>{user?.username || "Unnamed"}</h2>
        <p>{user?.status || "No status available"}</p>
      </div>

      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="Arrow" />
          </div>
        </div>
        
        <div className="option">
          <div className="title">
            <span>Privacy</span>
            <img src="./arrowUp.png" alt="Arrow" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="./arrowDown.png" alt="Arrow" />
          </div>
          <div className="photos">
            {user?.sharedPhotos?.length > 0 ? (
              user.sharedPhotos.map((photo, index) => (
                <div className="photoItem" key={index}>
                  <div className="photoDetail">
                    <img src={photo || "./avatar.png"} alt="Shared Photo" />
                    <span>Shared photo {index + 1}</span>
                  </div>
                  <img src="./download.png" alt="Download Icon" className="icon" />
                </div>
              ))
            ) : (
              <p>No shared photos available.</p>
            )}
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="Arrow" />
          </div>
        </div>

        {/* Block/Unblock Button */}
        <button onClick={handleBlock}>
          {isReciverBlocked || isCurrentUserBlocked ? "Unblock" : "Block"}
        </button>

        {/* Logout Button */}
        <button className="logout" onClick={() => auth.signOut()}>Log out</button>
      </div>
    </div>
  );
};

export default Detail;
