import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand'
import { db } from './firebase';
import { useUserStore } from './userStore';

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked:false,
  isRecieverBlocked:false,
    changeChat:(chatId,user) =>{
     const currentUser = useUserStore.getState().currentUser

     // CHECK IF CURRENT USER IS BLOCKED
     if(user.blocked.includes(currentUser.id)){
        return set({
            chatId: null,
            user: null,
            isCurrentUserBlocked: true,
            isRecieverBlocked:false,

        })
      }
  
      // CHECK IF RECIEVER IS BLOCKED

      else if(currentUser.blocked.includes(user.id)){
        return set({
            chatId: null,
            user: user,
            isCurrentUserBlocked: false,
            isRecieverBlocked:true,

        });
      }else{
        set({
            chatId,
            user,
            isCurrentUserBlocked: false,
            isRecieverBlocked:false,
        })
      }  

     changeBlock: () => {
        set(state => ({...state,isRecieverBlocked: !state.isRecieverBlocked }))
     }

    }
  
}));