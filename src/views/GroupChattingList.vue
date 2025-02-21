<template>
    <v-container class="chat-container">
        <v-row class="chat-row">
            <v-col>
                <v-card class="chat-list-card" elevation="0">
                    <v-card-title class="chat-room-header">
                        그룹 채팅방 목록
                        <div class="header-actions">
                            <v-text-field
                                v-model="searchQuery"
                                placeholder="채팅방 검색"
                                variant="outlined"
                                density="compact"
                                hide-details
                                class="search-input"
                                prepend-inner-icon="mdi-magnify"
                                @update:model-value="searchRooms"
                                clearable
                            ></v-text-field>
                            <v-btn 
                                color="primary" 
                                class="create-button" 
                                @click="showCreateRoomModal = true"
                                prepend-icon="mdi-plus"
                            >
                                채팅방 생성
                            </v-btn>
                        </div>
                    </v-card-title>
                    <v-card-text class="chat-rooms" @scroll="handleScroll" ref="chatRooms">
                        <div class="chat-rooms-content">
                            <v-list>
                                <v-list-item
                                    v-for="chat in chatRoomList"
                                    :key="chat.roomId"
                                    class="chat-room-item"
                                >
                                    <template v-slot:prepend>
                                        <v-icon color="primary" class="room-icon">mdi-account-group</v-icon>
                                    </template>
                                    <v-list-item-content>
                                        <v-list-item-title class="chat-room-name">
                                            {{ chat.roomName }}
                                        </v-list-item-title>
                                        <v-list-item-subtitle class="participant-count">
                                            참여인원: {{ chat.chatPaticipantCount }}명
                                        </v-list-item-subtitle>
                                    </v-list-item-content>
                                    <template v-slot:append>
                                        <v-btn
                                            color="primary"
                                            variant="tonal"
                                            class="join-button"
                                            @click="joinChatRoom(chat.roomId)"
                                        >
                                            참여하기
                                        </v-btn>
                                    </template>
                                </v-list-item>
                            </v-list>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- 채팅방 생성 모달 -->
        <v-dialog v-model="showCreateRoomModal" max-width="500px">
            <v-card class="modal-card">
                <v-card-title class="modal-title">
                    새로운 그룹 채팅방 생성
                </v-card-title>
                <v-card-text>
                    <v-text-field
                        v-model="newRoomTitle"
                        label="방 제목"
                        variant="outlined"
                        class="create-input"
                        placeholder="채팅방 이름을 입력하세요"
                    />
                </v-card-text>
                <v-card-actions class="modal-actions">
                    <v-btn color="grey" variant="text" @click="showCreateRoomModal = false">
                        취소
                    </v-btn>
                    <v-btn color="primary" @click="createChatRoom">
                        생성하기
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 에러 메시지 모달 -->
        <v-dialog v-model="trueOrFalse" max-width="400px" @keydown.enter="resetModal">
            <v-card class="error-modal">
                <v-card-text class="error-message">
                    {{errorMessage}}
                </v-card-text>
                <v-card-actions class="error-actions">
                    <v-btn color="primary" variant="text" block @click="resetModal">확인</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
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
            errorMessage:"",
            searchQuery: ""
        };
    },
    async created() {
        this.loadChatRoom();
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
        handleScroll(event) {
            const target = event.target;
            const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
            
            if (bottom && !this.isLoading && !this.isLastPage) {
                this.loadChatRoom();
            }
        },
        resetModal() {
            this.trueOrFalse=false
        },
        async searchRooms() {
            try {
                this.isLoading = true;
                this.currentPage = 0;
                this.isLastPage = false;
                this.chatRoomList = [];
                
                let params = {
                    size: this.pageSize,
                    page: 0
                };
                
                if (this.searchQuery) {
                    params.roomName = this.searchQuery;
                }

                const response = await axios.get(
                    `${process.env.VUE_APP_API_BASE_URL}/chat/room/group/list`,
                    { params }
                );
                this.chatRoomList = response.data.result.content;
                this.currentPage = 1;
                this.isLastPage = response.data.result.last;
                this.isLoading = false;
            } catch (error) {
                console.error('채팅방 검색 실패:', error);
                this.trueOrFalse = true;
                this.errorMessage = error.response.data.status_message;
                this.isLoading = false;
            }
        }
    }
};
</script>
<style scoped>
.chat-container {
    max-width: 1200px !important;
    margin: 0 auto;
    padding: 40px;
    background: #F8FAFC;
    min-height: 100vh;
}

.chat-row {
    background: white;
    border-radius: 24px;
    box-shadow: 0 4px 24px rgba(37, 99, 235, 0.06);
    max-width: 900px;
    margin: 0 auto;
}

.chat-list-card {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 120px);
}

.chat-room-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 32px;
    border-bottom: 1px solid rgba(37, 99, 235, 0.08);
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
}

.search-input {
    width: 300px;
}

.search-input :deep(.v-field) {
    border-radius: 12px;
    background-color: #F8FAFC;
}

.search-input :deep(.v-field--focused) {
    background-color: white;
    border-color: #2563EB;
}

.create-button {
    text-transform: none;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.chat-rooms {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
}

.chat-rooms-content {
    min-height: 100%;
}

.chat-room-item {
    margin-bottom: 16px;
    border-radius: 16px;
    transition: all 0.2s ease;
    border: 1px solid rgba(37, 99, 235, 0.08);
    padding: 16px 24px;
}

.chat-room-item:hover {
    background-color: #F8FAFC;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.08);
}

.room-icon {
    margin-right: 16px;
    font-size: 24px;
}

.chat-room-name {
    font-size: 1.1rem;
    font-weight: 500;
    color: #1E293B;
    margin-bottom: 6px;
}

.participant-count {
    font-size: 0.9rem;
    color: #64748B;
}

.join-button {
    text-transform: none;
    font-weight: 500;
    padding: 0 20px;
    height: 36px;
}

/* 모달 스타일 */
.modal-card {
    border-radius: 20px;
    overflow: hidden;
    max-width: 450px;
    margin: 0 auto;
}

.modal-title {
    padding: 28px;
    background: #F8FAFC;
    color: #1E293B;
    font-weight: 600;
    font-size: 1.25rem;
}

.create-input {
    margin: 24px 0 16px;
}

.modal-actions {
    padding: 20px 28px;
    display: flex;
    justify-content: flex-end;
    gap: 16px;
}

/* 에러 모달 스타일 */
.error-modal {
    border-radius: 16px;
    overflow: hidden;
}

.error-message {
    padding: 24px;
    text-align: center;
    color: #1E293B;
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

.error-actions {
    padding: 16px;
    display: flex;
    justify-content: center;
}

/* 스크롤바 스타일 */
.chat-rooms::-webkit-scrollbar {
    width: 6px;
}

.chat-rooms::-webkit-scrollbar-track {
    background: transparent;
}

.chat-rooms::-webkit-scrollbar-thumb {
    background-color: rgba(37, 99, 235, 0.2);
    border-radius: 3px;
}

.chat-rooms::-webkit-scrollbar-thumb:hover {
    background-color: rgba(37, 99, 235, 0.3);
}
</style>