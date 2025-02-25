<template>
    <v-container fluid class="main-container">
        <v-row justify="center">
            <!-- 메인 컨텐츠 -->
            <v-col cols="8">
                <!-- 채팅방 목록 헤더 -->
                <div class="board-header">
                    <h2 class="board-title" style="margin-left: 20px;">Toks</h2>
                    
                    <div class="search-area">
                        <v-text-field
                            v-model="searchQuery"
                            placeholder="Search Toks"
                            variant="outlined"
                            density="compact"
                            hide-details
                            class="search-input"
                            prepend-inner-icon="mdi-magnify"
                            @update:model-value="searchRooms"
                            clearable
                        ></v-text-field>
                    </div>

                    <v-btn 
                        color="primary" 
                        class="create-btn" 
                        @click="showCreateRoomModal = true"
                        prepend-icon="mdi-plus"
                        style="margin-right: 20px;"
                    >
                        new Toks
                    </v-btn>
                </div>

                <!-- 채팅방 목록 -->
                <div class="chat-list" ref="chatRooms">
                    <div v-for="chat in chatRoomList" 
                         :key="chat.roomId" 
                         class="chat-room-item"
                    >
                        <div class="room-header">
                            <div class="room-info">
                                <v-icon color="primary" class="room-icon">mdi-account-group</v-icon>
                                <div class="room-details">
                                    <h3 class="room-name">{{ chat.roomName }}</h3>
                                    <span class="participant-count">참여인원: {{ chat.chatPaticipantCount }}명</span>
                                </div>
                            </div>
                            <v-btn
                                color="primary"
                                variant="tonal"
                                class="join-button"
                                @click="joinChatRoom(chat.roomId)"
                            >
                                참여하기
                            </v-btn>
                        </div>
                    </div>
                    
                    <div v-if="isLoading && !isLastPage" class="loading-indicator">
                        <v-progress-circular
                            indeterminate
                            color="primary"
                        ></v-progress-circular>
                    </div>

                    <div v-if="isLastPage && chatRoomList.length > 0" class="end-message">
                        모든 채팅방을 불러왔습니다
                    </div>
                </div>
            </v-col>
        </v-row>

        <!-- 채팅방 생성 모달 -->
        <v-dialog v-model="showCreateRoomModal" max-width="500px">
            <v-card class="modal-card">
                <v-card-title class="modal-title">새로운 그룹 채팅방 생성</v-card-title>
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
                    <v-btn color="grey" variant="text" @click="showCreateRoomModal = false">취소</v-btn>
                    <v-btn color="primary" @click="createChatRoom">생성하기</v-btn>
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
    mounted() {
        // window 스크롤 이벤트 리스너 추가
        window.addEventListener('scroll', this.handleScroll);
    },
    unmounted() {
        // 컴포넌트 제거 시 이벤트 리스너 제거
        window.removeEventListener('scroll', this.handleScroll);
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
        handleScroll() {
            // 화면 하단에 도달했는지 체크
            const bottom = window.innerHeight + window.pageYOffset >= document.documentElement.offsetHeight - 100;
            
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
.main-container {
    background-color: #F8FAFC;
    min-height: 100vh;
    padding: 20px;
}

.board-header {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.board-title {
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
}

.search-area {
    flex: 1;
    margin: 0 20px;
    max-width: 400px;
}

.create-btn {
    text-transform: none;
    font-weight: 600;
}

.chat-list {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.chat-room-item {
    padding: 16px;
    border-bottom: 1px solid #eee;
    transition: all 0.2s;
    cursor: pointer;
}

.chat-room-item:last-child {
    border-bottom: none;
}

.chat-room-item:hover {
    background-color: #f8f9fa;
}

.room-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.room-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.room-icon {
    font-size: 24px;
}

.room-details {
    display: flex;
    flex-direction: column;
}

.room-name {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
}

.participant-count {
    font-size: 14px;
    color: #666;
}

.join-button {
    text-transform: none;
}

/* 모달 스타일 */
.modal-card {
    border-radius: 12px;
}

.modal-title {
    font-size: 20px;
    font-weight: 600;
    padding: 20px;
}

.modal-actions {
    padding: 16px;
}

@media (max-width: 768px) {
    .board-header {
        flex-direction: column;
        gap: 15px;
    }

    .search-area {
        flex-direction: column;
        max-width: 100%;
        margin: 15px 0;
    }
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

.loading-indicator {
    display: flex;
    justify-content: center;
    padding: 20px;
}

.end-message {
    text-align: center;
    padding: 20px;
    color: #666;
    font-size: 14px;
}
</style>