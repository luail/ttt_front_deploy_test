<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" md="8">
                <v-card>
                    <v-card-title class="text-center text-h5">
                        채팅
                    </v-card-title>
                    <v-card-text>
                        <div class="chat-box">
                            <div 
                             v-for="(msg, index) in messages"
                             :key="index"
                             :class="['chat-message', msg.senderNickName ===this.senderNickName ? 'sent' : 'received' ]"
                            >
                                <strong>{{ msg.senderNickName }}: </strong> {{ msg.message }}
                            </div>
                        </div>
                        <v-text-field
                            v-model="newMessage"
                            label="메시지 입력"
                            @keyup.enter="sendMessage"
                        />
                        <v-btn color="primary" block @click="sendMessage">전송</v-btn>
                    </v-card-text>
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
        }
    },
    async created(){
        this.senderNickName = localStorage.getItem("nickName");
        this.roomId = this.$route.params.roomId;
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chat/history/${this.roomId}`);
        this.messages = response.data.result;
        this.connectWebsocket();
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
},
        scrollToBottom(){
            this.$nextTick(()=>{
                const chatBox = this.$el.querySelector(".chat-box");
                chatBox.scrollTop = chatBox.scrollHeight;
            })
        },
        async disconnectWebSocket(){
            await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chat/room/${this.roomId}/read`);
            if(this.stompClient && this.stompClient.connected){
                this.stompClient.unsubscribe(`/topic/${this.roomId}`);
                this.stompClient.disconnect();
            }
        },
        
    },
}
</script>
<style>
.chat-box{
    height: 300px;
    overflow-y: auto;
    border: 1px solid #ddd;
    margin-bottom: 10px;
}

.chat-message{
    margin-bottom:10px;
}
.sent{
    text-align:right;
}
.received{
    text-align:left;
}
</style>