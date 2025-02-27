<template>
    <v-container fluid class="lounge-container">
        <div class="content-wrapper">
            <!-- 헤더 섹션 -->
            <div class="lounge-header">
                <div class="header-left">
                    <h1 class="lounge-title">라운지</h1>
                    <p class="lounge-subtitle">실시간으로 대화를 해요</p>
                </div>
                <div class="header-right">
                    <div class="search-wrapper">
                        <v-text-field
                            v-model="searchQuery"
                            placeholder="채팅방 검색하기"
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
                        class="create-room-btn" 
                        @click="showCreateRoomModal = true"
                    >
                        <v-icon>mdi-plus</v-icon>
                        새로운 라운지
                    </v-btn>
                </div>
            </div>

            <!-- 슬라이드 네비게이션 추가 -->
            <div class="rooms-container">
                <v-btn 
                    icon="mdi-chevron-left" 
                    class="nav-btn prev-btn"
                    @click="prevPage"
                    :disabled="isLoading"
                >
                </v-btn>

                <div class="rooms-grid">
                    <div v-for="(chat, index) in displayedRooms" 
                         :key="chat.roomId" 
                         class="room-card"
                         :style="{ '--index': index }"
                         @click="joinChatRoom(chat.roomId)"
                    >
                        <div class="room-card">
                            <div class="room-card-content">
                                <div class="room-header">
                                    <div class="room-icon">
                                        <v-icon size="28" color="primary">mdi-account-group</v-icon>
                                    </div>
                                </div>
                                <div class="room-main">
                                    <h3 class="room-name">{{ chat.roomName }}</h3>
                                    <div class="member-count">
                                        <v-icon size="18">mdi-account-multiple</v-icon>
                                        {{ chat.chatPaticipantCount }} 명 참여중
                                    </div>
                                    <v-btn
                                        class="join-btn"
                                        variant="text"
                                    >
                                        <span>라운지 입장</span>
                                        <v-icon>mdi-arrow-right</v-icon>
                                    </v-btn>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <v-btn 
                    icon="mdi-chevron-right" 
                    class="nav-btn next-btn"
                    @click="nextPage"
                    :disabled="isLoading"
                >
                </v-btn>
            </div>

            <!-- 페이지 인디케이터 -->
            <div class="page-indicator">
                {{ currentPage + 1 }} / {{ totalPages }}
            </div>
        </div>

        <!-- 모달은 기존 코드 유지 -->
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
            pageSize: 9,
            currentPage: 0,
            isLoading: false,
            isLastPage: false,
            trueOrFalse: false,
            errorMessage:"",
            searchQuery: "",
            totalPages: 1,
            displayedRooms: [],
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
                this.isLoading = true;
                let params = {
                    size: this.pageSize,
                    page: this.currentPage
                };
                
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chat/room/group/list`, { params });
                this.displayedRooms = response.data.result.content;
                this.isLastPage = response.data.result.last;
                this.totalPages = response.data.result.totalPages;
                this.isLoading = false;
            } catch (error) {
                console.error(error);
                this.trueOrFalse = true;
                this.errorMessage = error.response.data.status_message;
                this.isLoading = false;
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
                this.displayedRooms = [];
                
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
                this.displayedRooms = response.data.result.content;
                this.currentPage = 1;
                this.isLastPage = response.data.result.last;
                this.isLoading = false;
            } catch (error) {
                console.error('채팅방 검색 실패:', error);
                this.trueOrFalse = true;
                this.errorMessage = error.response.data.status_message;
                this.isLoading = false;
            }
        },
        async prevPage() {
            // 첫 페이지에서 이전 버튼 클릭 시 마지막 페이지로
            if (this.currentPage === 0) {
                this.currentPage = this.totalPages - 1;
            } else {
                this.currentPage--;
            }
            await this.loadChatRoom();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        },
        async nextPage() {
            // 마지막 페이지에서 다음 버튼 클릭 시 첫 페이지로
            if (this.currentPage === this.totalPages - 1) {
                this.currentPage = 0;
            } else {
                this.currentPage++;
            }
            await this.loadChatRoom();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
};
</script>
<style scoped>
.lounge-container {
    background-color: #f8fafc;
    min-height: 100vh;
    padding: 40px 20px;
}

.content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
}

/* 헤더 스타일링 수정 */
.lounge-header {
    display: flex;
    flex-direction: column;  /* 수직 방향으로 변경 */
    align-items: center;     /* 중앙 정렬 */
    margin-bottom: 40px;
    padding: 0 24px;
    gap: 32px;              /* 요소들 사이 간격 */
}

.header-left {
    text-align: center;     /* 텍스트 중앙 정렬 */
    margin: 0;              /* 기존 마진 제거 */
}

.lounge-title {
    font-size: 32px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
    line-height: 1.2;
}

.lounge-subtitle {
    font-size: 16px;
    color: #666;
    margin-top: 8px;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;           /* 전체 너비 사용 */
    max-width: 800px;      /* 최대 너비 제한 */
    justify-content: center; /* 중앙 정렬 */
}

.search-wrapper {
    width: 100%;           /* 검색창 너비 확장 */
    max-width: 600px;      /* 최대 너비 제한 */
}

.search-input :deep(.v-field) {
    border-radius: 12px;
    background-color: white !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.create-room-btn {
    border-radius: 12px;
    height: 44px;
    padding: 0 24px;
    font-weight: 600;
    text-transform: none;
    background: linear-gradient(45deg, #4f46e5, #6366f1) !important;
    box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2) !important;
}

/* 채팅방 그리드 */
.rooms-container {
    position: relative;
    display: flex;
    align-items: center;
    gap: 20px;
    margin: 40px auto;
    max-width: 1200px;
    padding: 0 24px;
}

.nav-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: white;
    color: #4f46e5;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    z-index: 2;
}

.nav-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0,0,0,0.15);
}

.nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.rooms-grid {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
}

.room-card {
    flex: 1;
    min-width: 320px;
    max-width: calc(33.333% - 16px);
    position: relative;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.room-card-content {
    position: relative;
    padding: 32px;
    background: white;
    border-radius: 28px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 24px;
    border: 1px solid rgba(0,0,0,0.04);
    backdrop-filter: blur(10px);
}

.room-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.room-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #f0f0ff 0%, #e8e8ff 100%);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.4s ease;
}

.room-main {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.room-name {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
    line-height: 1.3;
}

.member-count {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: #f8f8ff;
    border-radius: 16px;
    color: #4f46e5;
    font-size: 14px;
    font-weight: 500;
    width: fit-content;
}

.join-btn {
    margin-top: 8px;
    padding: 16px 24px;
    border-radius: 20px;
    background: #f8f8ff;
    color: #4f46e5;
    font-weight: 600;
    font-size: 15px;
    transition: all 0.4s ease;
    border: 1px solid rgba(79, 70, 229, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.join-btn .v-icon {
    transition: transform 0.4s ease;
}

.room-card:hover {
    transform: translateY(-8px);
}

.room-card:hover .room-card-content {
    border-color: rgba(79, 70, 229, 0.15);
    box-shadow: 0 20px 40px rgba(79, 70, 229, 0.08);
}

.room-card:hover .join-btn {
    background: #4f46e5;
    color: white;
    border-color: #4f46e5;
}

.room-card:hover .join-btn .v-icon {
    transform: translateX(4px);
}

.page-indicator {
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
    font-weight: 500;
    color: #666;
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

/* 애니메이션 효과 */
@keyframes fadeIn {
    from { 
        opacity: 0; 
        transform: translateX(20px); 
    }
    to { 
        opacity: 1; 
        transform: translateX(0); 
    }
}

.room-card {
    animation: fadeIn 0.6s ease forwards;
    animation-delay: calc(var(--index) * 0.1s);
    opacity: 0;
}

/* 아이콘 색상 고정 */
.room-icon .v-icon {
    color: #4f46e5 !important;
}
</style>