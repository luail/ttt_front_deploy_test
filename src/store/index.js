import { createStore } from 'vuex'
import axios from 'axios'

export default createStore({
    state: {
        chatList: [],
        currentRoomId: null
    },
    mutations: {
        SET_CHAT_LIST(state, chatList) {
            state.chatList = chatList;
        },
        SET_CURRENT_ROOM(state, roomId) {
            state.currentRoomId = roomId;
        },
        UPDATE_UNREAD_COUNT(state, roomId) {
            let chatRoom = state.chatList.find(chat => chat.roomId === roomId);
            
            // 채팅방이 없으면 새로 채팅방 목록을 가져오도록 함
            if (!chatRoom) {
                // 새 메시지가 왔는데 채팅방이 없다면, 채팅방 목록을 새로 가져와야 함
                axios.get(`${process.env.VUE_APP_API_BASE_URL}/chat/my/rooms`)
                    .then(response => {
                        state.chatList = response.data.result;
                    })
                    .catch(error => console.error('채팅방 목록 로드 실패:', error));
                return;
            }
            
            chatRoom.unReadCount += 1;
        }
    },
    actions: {
        setChatList({ commit }, chatList) {
            commit('SET_CHAT_LIST', chatList);
        },
        setCurrentRoom({ commit }, roomId) {
            commit('SET_CURRENT_ROOM', roomId);
        },
        handleNewMessage({ commit, state }, message) {
            if (state.currentRoomId !== message.roomId) {
                commit('UPDATE_UNREAD_COUNT', message.roomId);
            }
        }
    }
}) 