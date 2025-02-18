<template>
    <v-container class="chat-container">
        <v-row class="chat-row">
            <!-- 채팅방 목록 -->
            <v-col cols="12" md="4" class="chat-list-column">
                <v-card class="chat-list-card" elevation="0">
                    <v-card-title class="text-center text-h6">
                        채팅 목록
                    </v-card-title>
                    <v-card-text>
                        <div class="chat-rooms">
                            <v-list>
                                <v-list-item
                                    v-for="chat in chatList"
                                    :key="chat.roomId"
                                    :class="{'active-chat': chat.roomId === roomId}"
                                    @click="enterChatRoom(chat.roomId)"
                                >
                                    <v-list-item-content>
                                        <v-list-item-title class="chat-room-name">
                                            {{ getChatRoomName(senderNickName, chat.roomName) }}
                                        </v-list-item-title>
                                        <v-list-item-subtitle v-if="chat.unReadCount > 0" class="unread-count">
                                            읽지 않은 메시지: {{ chat.unReadCount }}
                                        </v-list-item-subtitle>
                                    </v-list-item-content>
                                    <template v-slot:append>
                                        <v-btn
                                            v-if="chat.isGroupChat === 'Y'"
                                            density="compact"
                                            icon="mdi-exit-to-app"
                                            variant="text"
                                            color="error"
                                            @click.stop="leaveChatRoom(chat.roomId)"
                                        ></v-btn>
                                    </template>
                                </v-list-item>
                            </v-list>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- 채팅창 -->
            <v-col cols="12" md="7" class="chat-main-column">
                <v-card class="chat-card" elevation="0">
                    <v-card-title class="chat-room-header">
                        {{ getChatRoomName(senderNickName, currentChatRoom ? currentChatRoom.roomName : '채팅방을 선택해주세요') }}
                    </v-card-title>
                    <div class="chat-content-wrapper">
                        <div class="chat-box" ref="chatBox">
                            <div 
                                v-for="(msg, index) in messages"
                                :key="index"
                                :class="['chat-message', msg.senderNickName === this.senderNickName ? 'sent' : 'received' ]"
                            >
                                <div class="message-content">
                                    <strong>{{ msg.senderNickName }}</strong>
                                    <p class="message-text">{{ msg.message }}</p>
                                    <span class="message-time">{{ formatTime(msg.sendTime) }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="input-area">
                            <v-text-field
                                v-model="newMessage"
                                @keyup.enter="sendMessage"
                                variant="outlined"
                                density="comfortable"
                                hide-details
                                class="message-input"
                                placeholder="메시지를 입력하세요..."
                                :bg-color="'white'"
                                label=""
                            />
                            <v-btn color="primary" block @click="sendMessage" class="send-button" elevation="0">
                                전송
                            </v-btn>
                        </div>
                    </div>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import Stomp from 'webstomp-client';
import axios from 'axios';
import SockJS from 'sockjs-client';

export default{
    data(){
        return {
            messages: [],
            newMessage: "",
            stompClient: null,
            token: "",
            senderNickName: null,
            roomId: null,
            chatList: [],
            currentChatRoom: null,
        }
    },
    async created(){
        this.senderNickName = localStorage.getItem("nickName");
        this.roomId = this.$route.params.roomId;
        
        // roomId가 있을 때만 채팅 히스토리와 웹소켓 연결을 실행
        if (this.roomId) {
            const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chat/history/${this.roomId}`);
            this.messages = response.data.result;
            this.connectWebsocket();
        }
        
        // 채팅방 목록은 항상 가져옴
        const chatListResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chat/my/rooms`);
        this.chatList = chatListResponse.data.result;
    },
    // 사용자가 현재 라우트에서 다른 라우트로 이동하려고 할때 호출되는 훅함수
    beforeRouteLeave(to, from, next) {
        this.disconnectWebSocket();
        next();
    },
    // 화면을 완전히 꺼버렸을때
    beforeUnmount() {
        this.disconnectWebSocket();
    },
    methods: {
        connectWebsocket(){
            if(this.stompClient && this.stompClient.connected) return;
            // sockjs는 websocket을 내장한 향상된 js 라이브러리. http엔드포인트 사용.
            const sockJs = new SockJS(`http://localhost:8080/connect`)
            this.stompClient = Stomp.over(sockJs);
            this.token = localStorage.getItem("token");
            this.stompClient.connect({
                Authorization: `Bearer ${this.token}`
            },
                ()=>{
                    this.stompClient.subscribe(`/topic/${this.roomId}`, (message) => {
                        const parseMessage = JSON.parse(message.body);
                        this.messages.push(parseMessage);
                        this.scrollToBottom();
                    },{Authorization: `Bearer ${this.token}`})
                }
            )
        },
        sendMessage() {
            if (this.newMessage.trim() === "") return;

            const message = {
                senderNickName: this.senderNickName,
                message: this.newMessage
            };

            console.log("📤 전송할 메시지:", message);

            if (this.stompClient && this.stompClient.connected) {
                console.log("✅ STOMP 연결 상태 확인됨");
                this.stompClient.send(`/publish/${this.roomId}`, JSON.stringify(message));
                console.log("✅ 메시지 전송 성공!");
            } else {
                console.error("❌ STOMP 클라이언트가 연결되지 않음");
            }

            this.newMessage = "";
            this.scrollToBottom();
        },
        scrollToBottom() {
            this.$nextTick(() => {
                if (this.$refs.chatBox) {
                    this.$refs.chatBox.scrollTop = this.$refs.chatBox.scrollHeight;
                }
            });
        },
        async disconnectWebSocket(){
            await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chat/room/${this.roomId}/read`);
            if(this.stompClient && this.stompClient.connected){
                this.stompClient.unsubscribe(`/topic/${this.roomId}`);
                this.stompClient.disconnect();
            }
        },
        async enterChatRoom(roomId) {
            if (this.roomId !== roomId) {
                try {
                    // 기존 웹소켓 연결이 있다면 먼저 끊기
                    if (this.roomId) {
                        this.disconnectWebSocket();
                    }
                    
                    this.roomId = roomId;
                    this.currentChatRoom = this.chatList.find(chat => chat.roomId === roomId);
                    
                    // 새로운 채팅방의 히스토리 가져오기
                    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chat/history/${roomId}`);
                    this.messages = response.data.result;
                    
                    // 읽지 않은 메시지 처리
                    await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chat/room/${roomId}/read`);
                    // chatList에서 해당 채팅방의 unReadCount를 0으로 업데이트
                    if (this.currentChatRoom) {
                        this.currentChatRoom.unReadCount = 0;
                    }
                    
                    // 새로운 웹소켓 연결
                    this.connectWebsocket();
                    this.scrollToBottom();
                } catch (error) {
                    console.error('채팅방 입장 실패:', error);
                }
            }
        },
        async leaveChatRoom(roomId) {
            try {
                await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/chat/room/group/${roomId}/leave`);
                this.chatList = this.chatList.filter(chat => chat.roomId !== roomId);
                
                // 현재 보고 있는 채팅방을 나갔다면 첫 번째 채팅방으로 이동
                if (this.roomId === roomId && this.chatList.length > 0) {
                    this.enterChatRoom(this.chatList[0].roomId);
                } else if (this.chatList.length === 0) {
                    // 채팅방이 없다면 채팅방 목록 페이지로 이동
                    this.$router.push('/ttt/mychatpage');
                }
            } catch (error) {
                console.error('채팅방 나가기 실패:', error);
                // 에러 처리 필요시 추가
            }
        },
        getChatRoomName(currentUser, roomName) {
            if (roomName.includes('-')) {
                const [user1, user2] = roomName.split('-');
                
                return currentUser === user1 ? user2 : user1;
            }
            
            return roomName;
        },
        formatTime(timestamp) {
            if (!timestamp) return '';
            const date = new Date(timestamp);
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? '오후' : '오전';
            const formattedHours = hours % 12 || 12;
            const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
            
            return `${ampm} ${formattedHours}:${formattedMinutes}`;
        },
    },
    mounted() {
        this.scrollToBottom();
    },
    updated() {
        this.scrollToBottom();
    }
}
</script>
<style scoped>
.chat-container {
    display: flex;
    height: 100vh;
    background-color: #f7f7f7;
}

.chat-list {
    width: 300px;
    background-color: #ffffff;
    margin: 16px;
    margin-right: 8px;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.chat-room {
    flex: 1;
    background-color: #ffffff;
    margin: 16px;
    margin-left: 8px;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
}

.chat-row {
    gap: 24px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
}

.chat-list-column {
    padding: 20px;
    border-right: 1px solid rgba(107, 41, 229, 0.1);
    position: relative;
}

.chat-list-column::after {
    content: '';
    position: absolute;
    right: 0;
    top: 5%;
    height: 90%;
    width: 1px;
    background: linear-gradient(
        to bottom,
        transparent,
        rgba(107, 41, 229, 0.2),
        transparent
    );
}

.chat-main-column {
    padding: 20px;
    background: rgba(248, 249, 250, 0.5);
    border-top-right-radius: 16px;
    border-bottom-right-radius: 16px;
}

.chat-card, .chat-list-card {
    height: calc(100vh - 140px);
    background: transparent;
    box-shadow: none;
}

.chat-list-card {
    border-radius: 12px;
}

.chat-box {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}

.v-list {
    background: transparent;
    padding: 8px;
}

.v-list-item {
    margin-bottom: 8px;
    border-radius: 12px;
    transition: all 0.2s ease;
}

.v-list-item:hover {
    background-color: rgba(107, 41, 229, 0.05);
}

.active-chat {
    background-color: rgba(107, 41, 229, 0.1) !important;
    border-left: 3px solid #6B29E5;
}

.chat-room-name {
    font-weight: 500;
    color: #333;
}

.unread-count {
    color: #6B29E5;
    font-size: 0.8rem;
    margin-top: 4px;
}

.chat-rooms {
    height: calc(100vh - 200px);
    overflow-y: auto;
}

.chat-message {
    margin-bottom: 20px;
    max-width: 75%;
    width: fit-content;
}

.message-content {
    position: relative;
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 0.95rem;
    line-height: 1.5;
}

.sent {
    margin-left: auto;
}

.sent .message-content {
    background-color: #6B29E5;
    color: white;
    border-bottom-right-radius: 4px;
}

.received .message-content {
    background-color: white;
    border-bottom-left-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.sent strong {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.8rem;
    margin-bottom: 4px;
    display: block;
}

.received strong {
    color: #6B29E5;
    font-size: 0.8rem;
    margin-bottom: 4px;
    display: block;
}

.message-text {
    margin: 0;
}

.input-area {
    padding: 16px 20px;
    background: white;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.message-input {
    margin-bottom: 12px;
}

.message-input :deep(.v-field) {
    border-radius: 25px !important;
    background-color: #f8f9fa;
    border: 1px solid transparent;
    transition: all 0.2s ease;
}

.message-input :deep(.v-field--focused) {
    border-color: #6B29E5 !important;
    background-color: white;
}

.message-input :deep(.v-field__outline) {
    display: none !important;
}

.send-button {
    height: 44px;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    background-color: #6B29E5 !important;
    border-radius: 12px;
    transition: all 0.2s ease;
}

.send-button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
}

.chat-box::-webkit-scrollbar {
    width: 6px;
}

.chat-box::-webkit-scrollbar-track {
    background: transparent;
}

.chat-box::-webkit-scrollbar-thumb {
    background-color: rgba(107, 41, 229, 0.2);
    border-radius: 3px;
}

.chat-rooms::-webkit-scrollbar {
    width: 6px;
}

.chat-rooms::-webkit-scrollbar-track {
    background: transparent;
}

.chat-rooms::-webkit-scrollbar-thumb {
    background-color: rgba(107, 41, 229, 0.2);
    border-radius: 3px;
}

.chat-room-header {
    text-align: center;
    padding: 16px 0;
    font-weight: 500;
    color: #333;
    border-bottom: 1px solid rgba(107, 41, 229, 0.1);
    margin-bottom: 8px;
}

.chat-content-wrapper {
    position: relative;
    height: calc(100vh - 180px);
    display: flex;
    flex-direction: column;
}

.chat-box {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background-color: white;
    border-radius: 12px;
    margin-bottom: 0;
}

.input-area {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    padding: 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 0 0 12px 12px;
    z-index: 1;
}

.message-time {
    font-size: 0.75rem;
    color: #999;
    margin-top: 4px;
    display: block;
}

.sent .message-time {
    color: rgba(255, 255, 255, 0.7);
}

.received .message-time {
    color: #666;
}
</style>