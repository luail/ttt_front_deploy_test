<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title class="text-center text-h5">
                        채팅방 목록
                        <div class="d-flex justify-end">
                            <v-btn color="secondary" @click="showCreateRoomModal = true">
                                채팅방 생성
                            </v-btn>
                        </div>
                    </v-card-title>
                    <v-card-text>
                        <v-table>
                            <thead>
                                <tr>
                                    <th>방제목</th>
                                    <th>참여인원</th>
                                    <th>채팅</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="chat in chatRoomList" :key="chat.roomId">
                                    <td>{{ chat.roomName }}</td>
                                    <td>{{ chat.chatPaticipantCount }}</td>
                                    <td>
                                        <v-btn color="primary" @click="joinChatRoom(chat.roomId)">
                                            참여하기
                                        </v-btn>
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-dialog v-model="showCreateRoomModal" max-width="500px">
            <v-card>
                <v-card-title class="text-h6">
                    채팅방 생성
                </v-card-title>
                <v-card-text>
                    <v-text-field label="방제목" v-model="newRoomTitle"/>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="grey" @click="showCreateRoomModal = false">
                        취소
                    </v-btn>
                    <v-btn color="primary" @click="createChatRoom">
                        생성
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
    <v-dialog v-model="trueOrFalse" max-width="400px" @keydown.enter="resetModal()">
        <v-card>
            <v-card-text class="error-message">
                {{errorMessage}}
            </v-card-text>
            <v-card-actions>
                <v-btn color="c0c1ff" @click="resetModal()">확인</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import axios from 'axios';
export default {
    data() {
        return {
            chatRoomList: [],
            showCreateRoomModal: false,
            newRoomTitle: "",
            pageSize: 10,
            currentPage: 0,
            isLoading: false,
            isLastPage: false,
            trueOrFalse: false,
            errorMessage:""
        };
    },
    async created() {
        this.loadChatRoom();
        window.addEventListener('scroll', this.scrollPagination);
    },
    methods: {
        async joinChatRoom(roomId) {
            await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chat/room/group/${roomId}/join`);
            this.$router.push(`/ttt/chatpage/${roomId}`);
        },
        async createChatRoom() {
            try{
                await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chat/room/group/create?roomName=${this.newRoomTitle}`, null);
                this.showCreateRoomModal = false;
                window.location.reload()
            } catch(error) {
                console.log(error)
                this.trueOrFalse=true
                this.errorMessage = error.response.data.status_message
            }

        },
        async loadChatRoom() {
            try {
                if (this.isLoading || this.isLastPage) return;
                this.isLoading = true;
                
                let params = {
                    size: this.pageSize,
                    page: this.currentPage
                };
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chat/room/group/list`, { params });
                const additionalData = response.data.result.content;
                
                if (additionalData.length === 0) {
                    this.isLastPage = true;
                    return;
                }
                
                this.chatRoomList = [...this.chatRoomList, ...additionalData];
                this.currentPage++;
                this.isLoading = false;
            } catch (error) {
                console.log(error);
                this.trueOrFalse=true
                this.errorMessage = error.response.data.status_message
            }
        },
        scrollPagination() {
            const isBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
            if (isBottom) {
                this.loadChatRoom();
            }
        },
        resetModal() {
            this.trueOrFalse=false
        }
    }
};
</script>
<style scoped>
    /* 에러 메시지가 너무 길 경우 짤려서 끝에 ...으로 표현되는것 전체가 나오도록 수정 */
    .error-message {
        white-space: normal; /* 기본 줄바꿈 허용 */
        word-wrap: break-word; /* 단어가 너무 길어도 자동 줄바꿈 */
        overflow-wrap: break-word; /* 긴 단어도 줄바꿈 가능 */
        text-align: center; /* 가운데 정렬 */
    }
</style>