import { createStore } from 'vuex'

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
            const chatRoom = state.chatList.find(chat => chat.roomId === roomId);
            if (chatRoom && state.currentRoomId !== roomId) {
                chatRoom.unReadCount++;
                state.chatList.sort((a, b) => b.unReadCount - a.unReadCount);
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
            commit('UPDATE_UNREAD_COUNT', { roomId: message.roomId });
        }
    }
}) 