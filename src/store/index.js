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
        UPDATE_UNREAD_COUNT(state, { roomId }) {
            const chat = state.chatList.find(c => c.roomId === roomId);
            if (!chat) {
                // 채팅방이 목록에 없으면 새로 가져오기
                axios.get(`${process.env.VUE_APP_API_BASE_URL}/chat/my/rooms`)
                    .then(response => {
                        state.chatList = response.data.result;
                    })
                    .catch(error => console.error('채팅방 목록 로드 실패:', error));
                return;
            }
            
            // 현재 채팅방이 아닌 경우에만 안 읽은 메시지 수 증가
            if (state.currentRoomId !== roomId) {
                chat.unReadCount = (chat.unReadCount || 0) + 1;
            }
        }
    },
    actions: {
        setChatList({ commit }, chatList) {
            commit('SET_CHAT_LIST', chatList);
        },
        setCurrentRoom({ commit }, roomId) {
            commit('SET_CURRENT_ROOM', roomId);
        },
        handleNewMessage({ commit }, message) {
            commit('UPDATE_UNREAD_COUNT', {
                roomId: message.roomId
            });
        }
    },
    getters: {
        totalUnreadCount: state => {
            return state.chatList.reduce((total, chat) => total + (chat.unReadCount || 0), 0);
        }
    }
}) 