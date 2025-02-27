<template>
  <v-container class="pt-0">
    <v-row justify="center">
      <!-- 메인 컨텐츠 -->
      <v-col cols="8" class="mx-auto">
        <v-card class="post-container">
          <div class="post-title pa-6 pb-2">
            <div class="d-flex justify-space-between align-center">
              <h1>프로젝트 개요</h1>
              <div v-if="isAuthor" class="post-actions">
                <v-btn
                  color="primary"
                  text
                  class="mr-2"
                  @click="editProject"
                >
                  수정
                </v-btn>
                <v-btn
                  color="error"
                  text
                  @click="deleteProject"
                >
                  삭제
                </v-btn>
              </div>
            </div>
          </div>
          <!-- 게시글 헤더 -->
          <div class="post-header pa-6">
            <!-- 프로젝트 정보 테이블 -->
            <div class="project-info-table">
              <div class="info-row">
                <div class="info-label">과제타입</div>
                <div class="info-value">
                  <!-- {{ thisProject.projectType }} -->
                  <span class="remaining-time">{{ thisProject.projectType }}</span>
                  <!-- <span class="status-tag">{{ thisProject.projectType }}</span> -->
                </div>
              </div>
              <div class="info-row">
                <div class="info-label">서비스명</div>
                <div class="info-value">
                  <span class="remaining-time">{{ thisProject.serviceName }}</span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-label">팀명</div>
                <div class="remaining-time">{{ thisProject.teamName }}</div>
              </div>
              <div class="info-row">
                <div class="info-label">주제</div>
                <div class="status-tag">{{ thisProject.domain }}</div>
              </div>
              <div class="info-row">
                <div class="info-label">링크</div>
                <div class="info-value">
                  <v-icon
                    v-if="thisProject.link"
                    small
                    color="primary"
                    class="link-icon"
                    @click="openProjectLink(thisProject.link)"
                    style="cursor: pointer"
                  >
                    mdi-link-variant
                  </v-icon>
                  <span v-else class="no-link">링크 없음</span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-label">올린이</div>
                <div class="info-value">{{ thisProject.userName }}</div>
                <v-icon v-if="!isAuthor" class="ml-2" @click="gotoChat(thisProject.userRealId)">mdi-forum-outline</v-icon>
              </div>
            </div>
          </div>

          <!-- 게시글 제목 -->
          <div class="post-title pa-6 pb-2">
            <h1>프로젝트 소개</h1>
          </div>

          <!-- 게시글 내용 -->
          <div class="post-content pa-6" v-html="thisProject.explanation"></div>

          <!-- 좋아요 & 공유 버튼 -->
          <v-card-actions class="post-actions pa-6">
            <v-btn
              text
              :color="thisProject.liked ? 'primary' : ''"
              @click="toggleLike"
              class="like-btn"
            >
              <v-icon left>{{ thisProject.liked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline' }}</v-icon>
              {{ thisProject.likesCount || 0 }}
            </v-btn>
          </v-card-actions>

          <!-- 댓글 섹션 -->
          <v-divider></v-divider>
          
          <div class="comment-section">
            <!-- 메인 댓글 입력 폼 -->
            <div class="comment-input-wrapper">
              <div class="avatar-container">
                <img :src="userProfileImage || require('@/assets/basicProfileImage.png')" class="comment-user-avatar" />
              </div>
              <v-textarea
                v-model="newComment"
                placeholder="댓글을 입력하세요..."
                outlined
                hide-details
                rows="1"
                auto-grow
                class="comment-textarea"
                background-color="white"
                no-resize
              ></v-textarea>
              <div class="btn-container">
                <button 
                  :disabled="!newComment.trim()"
                  @click="submitComment"
                  class="custom-submit-btn"
                >
                  댓글 쓰기
                </button>
              </div>
            </div>

            <!-- 댓글 목록 -->
            <div v-if="thisProject.commentList && thisProject.commentList.length > 0" class="comments-container">
              <div v-for="comment in thisProject.commentList" :key="comment.commentId" class="comment-item">
                <!-- 댓글 헤더 -->
                <div class="comment-header">
                  <img :src="comment.profileImageOfCommentAuthor || require('@/assets/basicProfileImage.png')" class="comment-avatar" />
                  <div class="comment-info">
                    <span class="comment-author">{{ comment.nickNameOfCommentAuthor }}</span>
                    <span class="comment-time">{{ formatDate(comment.createdTime) }}</span>
                  </div>
                  <!-- 작성자인 경우에만 수정/삭제 버튼 표시 -->
                  <div v-if="comment.loginIdOfCommentAuthor === userId" class="comment-actions">
                    <button class="action-btn edit" @click="editComment(comment)">수정</button>
                    <button class="action-btn delete" @click="deleteComment(comment.commentId)">삭제</button>
                  </div>
                </div>

                <!-- 댓글 내용 (수정 모드/일반 모드) -->
                <div class="comment-body">
                  <div v-if="editingCommentId === comment.commentId" class="edit-form">
                    <v-textarea
                      v-model="editingCommentContent"
                      outlined
                      dense
                      hide-details
                      auto-grow
                      rows="1"
                    ></v-textarea>
                    <div class="edit-actions">
                      <button class="action-btn save" @click="updateComment(comment.commentId)">저장</button>
                      <button class="action-btn cancel" @click="cancelEdit()">취소</button>
                    </div>
                  </div>
                  <div v-else>
                    <p class="comment-text">{{ comment.contents }}</p>
                    <button class="reply-btn" @click="toggleReply(comment.commentId)">답글 달기</button>
                  </div>
                </div>

                <!-- 답글 입력 폼 -->
                <div v-if="replyCommentVisible[comment.commentId]" class="reply-form">
                  <div class="comment-input-wrapper reply-wrapper">
                    <div class="avatar-container">
                      <img :src="userProfileImage || require('@/assets/basicProfileImage.png')" class="comment-user-avatar" />
                    </div>
                    <v-textarea
                      v-model="newReply"
                      placeholder="답글을 입력하세요..."
                      outlined
                      hide-details
                      rows="1"
                      auto-grow
                      class="comment-textarea"
                      background-color="white"
                      no-resize
                    ></v-textarea>
                    <div class="btn-container">
                      <button 
                        :disabled="!newReply.trim()"
                        @click="submitReply(comment.commentId)"
                        class="custom-submit-btn"
                      >
                        답글 쓰기
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 대댓글 목록 -->
                <div v-if="comment.childCommentList && comment.childCommentList.length > 0" class="replies-container">
                  <div v-for="reply in comment.childCommentList" :key="reply.commentId" class="reply-item">
                    <div class="comment-header">
                      <img :src="reply.profileImageOfCommentAuthor || require('@/assets/basicProfileImage.png')" class="comment-avatar" />
                      <div class="comment-info">
                        <span class="comment-author">{{ reply.nickNameOfCommentAuthor }}</span>
                        <span class="comment-time">{{ formatDate(reply.createdTime) }}</span>
                      </div>
                      <div v-if="reply.loginIdOfCommentAuthor === userId" class="comment-actions">
                        <button class="action-btn edit" @click="editReply(reply)">수정</button>
                        <button class="action-btn delete" @click="deleteComment(reply.commentId)">삭제</button>
                      </div>
                    </div>

                    <div class="comment-body">
                      <div v-if="editingReplyId === reply.commentId" class="edit-form">
                        <v-textarea
                          v-model="editingReplyContent"
                          outlined
                          dense
                          hide-details
                          auto-grow
                          rows="1"
                        ></v-textarea>
                        <div class="edit-actions">
                          <button class="action-btn save" @click="updateReply(reply.commentId)">저장</button>
                          <button class="action-btn cancel" @click="cancelReplyEdit()">취소</button>
                        </div>
                      </div>
                      <div v-else>
                        <p class="comment-text">{{ reply.contents }}</p>
                        <button class="reply-btn" @click="toggleReply(reply.commentId)">답글 달기</button>
                      </div>
                    </div>

                    <!-- 대댓글의 답글 입력 폼 -->
                    <div v-if="replyCommentVisible[reply.commentId]" class="nested-reply-form">
                      <div class="comment-input-wrapper reply-wrapper">
                        <div class="avatar-container">
                          <img :src="userProfileImage || require('@/assets/basicProfileImage.png')" class="comment-user-avatar" />
                        </div>
                        <v-textarea
                          v-model="newNestedReply"
                          placeholder="답글을 입력하세요..."
                          outlined
                          hide-details
                          rows="1"
                          auto-grow
                          class="comment-textarea"
                          background-color="white"
                          no-resize
                        ></v-textarea>
                        <div class="btn-container">
                          <button 
                            :disabled="!newNestedReply.trim()"
                            @click="submitNestedReply(reply.commentId)"
                            class="custom-submit-btn"
                          >
                            답글 쓰기
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- 대대댓글 목록 -->
                    <div v-if="reply.childCommentList && reply.childCommentList.length > 0" class="nested-replies-container">
                      <div v-for="nestedReply in reply.childCommentList" :key="nestedReply.commentId" class="nested-reply-item">
                        <div class="comment-header">
                          <img :src="nestedReply.profileImageOfCommentAuthor || require('@/assets/basicProfileImage.png')" class="comment-avatar" />
                          <div class="comment-info">
                            <span class="comment-author">{{ nestedReply.nickNameOfCommentAuthor }}</span>
                            <span class="comment-time">{{ formatDate(nestedReply.createdTime) }}</span>
                          </div>
                          <div v-if="nestedReply.loginIdOfCommentAuthor === userId" class="comment-actions">
                            <button class="action-btn edit" @click="editNestedReply(nestedReply)">수정</button>
                            <button class="action-btn delete" @click="deleteComment(nestedReply.commentId)">삭제</button>
                          </div>
                        </div>
                        <div class="comment-body">
                          <div v-if="editingNestedReplyId === nestedReply.commentId" class="edit-form">
                            <v-textarea
                              v-model="editingNestedReplyContent"
                              outlined
                              dense
                              hide-details
                              auto-grow
                              rows="1"
                            ></v-textarea>
                            <div class="edit-actions">
                              <button class="action-btn save" @click="updateNestedReply(nestedReply.commentId)">저장</button>
                              <button class="action-btn cancel" @click="cancelNestedReplyEdit()">취소</button>
                            </div>
                          </div>
                          <div v-else>
                            <p class="comment-text">{{ nestedReply.contents }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

dayjs.extend(relativeTime);
dayjs.locale('ko');

export default {
  data() {
    return {
      thisProject: {},
      commetList:[],
      userId: '',
      userProfileImage: '',
      newComment: '',
      newReply: '',
      newNestedReply: '',
      isAuthor: false,
      editingCommentId: null,
      editingCommentContent: '',
      editingReplyId: null,
      editingReplyContent: '',
      editingNestedReplyId: null,
      editingNestedReplyContent: '',
      replyCommentVisible: {},
    }
  },

  async created() {
    // 컴포넌트가 생성될 때 스크롤을 맨 위로 이동
    window.scrollTo(0, 0);

    // 게시글 상세 정보 불러오기
    await this.refreshPost();

    // 사용자 정보 설정
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      this.userId = decodedToken.sub;
      console.log("로그인아이디"+this.userId)
      this.isAuthor = this.thisProject.userId === this.userId;
      console.log("맞혀봐")
      console.log(this.isAuthor)
      
      // 사용자 프로필 이미지 가져오기
      // try {
      //   const userResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/profile`);
      //   this.userProfileImage = userResponse.data.profileImage;
      // } catch (error) {
      //   console.log("프로필 이미지 로드 실패", error);
      // }
    }
  },

  methods: {
    // 댓글 작성
    async submitComment() {
      try {
        const comment = {
          contents: this.newComment,
          projectId: this.$route.params.id
        };
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/comment/createforp`, comment);
        this.newComment = '';
        await this.refreshPost();
      } catch (error) {
        console.log("댓글 작성 실패", error);
      }
    },

    // 답글 작성
    async submitReply(parentId) {
      try {
        const reply = {
          contents: this.newReply,
          projectId: this.$route.params.id,
          parentId: parentId
        };
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/comment/createforp`, reply);
        this.newReply = '';
        this.replyCommentVisible[parentId] = false;
        await this.refreshPost();
      } catch (error) {
        console.log("답글 작성 실패", error);
      }
    },

    // 댓글 수정
    editComment(comment) {
      this.editingCommentId = comment.commentId;
      this.editingCommentContent = comment.contents;
    },

    // 댓글 수정 저장
    async updateComment(commentId) {
      try {
        await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/comment/update/${commentId}`, {
          contents: this.editingCommentContent
        });
        this.editingCommentId = null;
        this.editingCommentContent = '';
        await this.refreshPost();
      } catch (error) {
        console.log("댓글 수정 실패", error);
      }
    },

    // 댓글 수정 취소
    cancelEdit() {
      this.editingCommentId = null;
      this.editingCommentContent = '';
    },

    // 댓글 삭제
    async deleteComment(commentId) {
      if (confirm("정말로 삭제하시겠습니까?")) {
        try {
          await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/comment/delete/${commentId}`);
          await this.refreshPost();
        } catch (error) {
          console.log("댓글 삭제 실패", error);
        }
      }
    },

    // 답글 토글 개선
    toggleReply(commentId) {
      this.replyCommentVisible = {
        ...this.replyCommentVisible,
        [commentId]: !this.replyCommentVisible[commentId]
      };
      if (this.replyCommentVisible[commentId]) {
        // 다른 모든 답글 입력창 닫기
        Object.keys(this.replyCommentVisible).forEach(key => {
          if (key !== commentId.toString()) {
            this.replyCommentVisible[key] = false;
          }
        });
        // 입력 필드 초기화
        this.newReply = '';
        this.newNestedReply = '';
      }
    },

    // 게시글 새로고침
    async refreshPost() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/project/detailsee/${this.$route.params.id}`);
        this.thisProject = response.data.result;
        console.log("디프")
        console.log(this.thisProject);
      } catch (error) {
        console.log("게시글 새로고침 실패", error);
      }
    },

    // 날짜 포맷
    formatDate(dateArray) {
      if (!dateArray || dateArray.length < 6) return '';
      const formattedDate = dayjs(
        `${dateArray[0]}-${dateArray[1].toString().padStart(2, '0')}-${dateArray[2].toString().padStart(2, '0')}` +
        `T${dateArray[3].toString().padStart(2, '0')}:${dateArray[4].toString().padStart(2, '0')}:${dateArray[5].toString().padStart(2, '0')}`
      );
      return dayjs().diff(formattedDate, 'hour') < 24 
        ? formattedDate.fromNow() 
        : formattedDate.format('YYYY-MM-DD');
    },

    // 좋아요 누르면, 아이콘 색깔, 좋아요 개수 변화
    async toggleLike(){
      try{
        const projectId = this.$route.params.id
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/Likes/projectLike/${projectId}`);
        console.log("조아여")
        console.log(response);
        this.thisProject.liked=response.data.result.liked;
        this.thisProject.likesCount=response.data.result.likesCount;
      }catch(error){
        console.log("좋아요 실패",error);
      }  
      },

    async gotoChat(otherUserId) {
      const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chat/room/private/create?otherUserId=${otherUserId}`) 
      const roomId = response.data.result;
      this.$router.push(`/ttt/chatpage/${roomId}`)
    },

    // 대댓글 수정
    editReply(reply) {
      this.editingReplyId = reply.commentId;
      this.editingReplyContent = reply.contents;
    },

    // 대댓글 수정 저장
    async updateReply(commentId) {
      try {
        await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/comment/update/${commentId}`, {
          contents: this.editingReplyContent
        });
        this.editingReplyId = null;
        this.editingReplyContent = '';
        await this.refreshPost();
      } catch (error) {
        console.log("대댓글 수정 실패", error);
      }
    },

    // 대댓글 수정 취소
    cancelReplyEdit() {
      this.editingReplyId = null;
      this.editingReplyContent = '';
    },

    // 대대댓글 작성
    async submitNestedReply(parentId) {
      try {
        const nestedReply = {
          contents: this.newNestedReply,
          projectId: this.$route.params.id,
          parentId: parentId
        };
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/comment/createforp`, nestedReply);
        this.newNestedReply = '';
        this.replyCommentVisible[parentId] = false;
        await this.refreshPost();
      } catch (error) {
        console.log("대대댓글 작성 실패", error);
      }
    },

    // 대대댓글 수정
    editNestedReply(reply) {
      this.editingNestedReplyId = reply.commentId;
      this.editingNestedReplyContent = reply.contents;
    },

    // 대대댓글 수정 저장
    async updateNestedReply(commentId) {
      try {
        await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/comment/update/${commentId}`, {
          contents: this.editingNestedReplyContent
        });
        this.editingNestedReplyId = null;
        this.editingNestedReplyContent = '';
        await this.refreshPost();
      } catch (error) {
        console.log("대대댓글 수정 실패", error);
      }
    },

    // 대대댓글 수정 취소
    cancelNestedReplyEdit() {
      this.editingNestedReplyId = null;
      this.editingNestedReplyContent = '';
    },

    async editProject() {
      this.$router.push(`/ttt/project/update/${this.$route.params.id}`);
    },
    
    async deleteProject() {
      if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
        try {
          await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/project/delete/${this.$route.params.id}`);
          this.$router.push('/ttt/project/find');
        } catch (error) {
          console.log("프로젝트 삭제 실패", error);
        }
      }
    },

    openProjectLink(url) {
      const formattedUrl = this.formatUrl(url);
      if (formattedUrl) {
        window.open(formattedUrl, '_blank');
      }
    },

    formatUrl(url) {
      if (!url || url.trim() === "") return null;
      return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    }
  }
}
</script>

<style scoped>
::v-deep(.post-content .ql-size-huge) {
  font-size: 2.5rem !important;
}

::v-deep(.post-content .ql-size-large) {
  font-size: 1.75rem !important;
}

::v-deep(.post-content .ql-size-small) {
  font-size: 0.75rem !important;
}

::v-deep(.post-content img) {
  max-width: 100% !important;  /* 컨테이너 너비에 맞춤 */
  height: auto !important;      /* 원본 비율 유지 */
  display: block !important;    /* 인라인 문제 방지 */
  margin: 10px auto !important; /* 중앙 정렬 */
  object-fit: contain !important; /* 이미지 잘리지 않게 */
}



.post-container {
  border-radius: 8px;
  overflow: hidden;
}

.category-tag {
  color: #1976d2;
  font-size: 0.9rem;
  font-weight: 500;
}

.post-title h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.author-name {
  font-weight: 500;
  color: #1a202c;
}

.post-meta {
  font-size: 0.875rem;
  color: #718096;
}

.post-content {
  font-size: 1rem;
  line-height: 1.8;
  color: #2d3748;
}

.like-btn {
  border-radius: 20px;
  font-weight: 500;
}

.comment-item {
  margin: 8px 0;
  font-size: 14px;
}

.comment-author-img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.comment-author {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
}

.comment-meta {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.comment-text {
  font-size: 13px;
  line-height: 1.4;
}

.reply-actions {
  margin-top: 4px;
}

.reply-actions .v-btn {
  font-size: 12px;
  height: 24px !important;
  min-height: 0;
  padding: 0 8px;
}

.child-comments {
  margin-left: 32px;
  margin-top: 4px;
}

.child-comment-item {
  margin: 6px 0;
}

.grandchild-comments {
  margin-left: 28px;
  margin-top: 4px;
}

.grandchild-comment-item {
  margin: 6px 0;
}

.v-divider {
  margin: 8px 0;
}

.reply-form {
  margin-left: 32px;
  margin-top: 8px;
}

.reply-wrapper {
  transform: scale(0.95);
  transform-origin: left top;
}

.category-sidebar {
  background: white;
  border-radius: 4px;
  overflow: hidden;
  position: sticky;
  top: 80px; /* 상단 네비게이션 바 높이에 맞춰 조정 */
  height: calc(100vh - 100px); /* 뷰포트 높이에서 상단 여백 제외 */
  overflow-y: auto; /* 내용이 많을 경우 스크롤 가능하도록 */
}

/* 스크롤바 스타일링 */
.category-sidebar::-webkit-scrollbar {
  width: 6px;
}

.category-sidebar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.category-sidebar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.category-sidebar::-webkit-scrollbar-thumb:hover {
  background: #9155FD;
}

.sidebar-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  padding: 16px 20px;
  margin: 0;
  border-bottom: 2px solid #9155FD;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.category-list {
  background: transparent !important;
}

.category-item {
  padding: 12px 20px !important;
  min-height: 0 !important;
  border-left: 3px solid transparent;
}

.active-category {
  background-color: #F4F1FA !important;
  border-left: 3px solid #9155FD;
}

.selected-text {
  color: #9155FD;
  font-weight: 500;
}

.category-item:hover {
  background-color: #F4F1FA !important;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.reply-form {
  background-color: #f5f6f8;
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
}

.reply-actions {
  opacity: 0.8;
  transition: opacity 0.2s;
}

.reply-actions:hover {
  opacity: 1;
}

.comment-form-section {
  margin: 16px 0;
}

.comment-input-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
}

.avatar-container {
  padding-top: 8px; /* 프로필 이미지를 텍스트 시작점과 맞춤 */
}

.comment-user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.comment-textarea {
  flex-grow: 1;
}

.comment-textarea >>> .v-input__slot {
  box-shadow: none !important;
  border: none !important;
  min-height: 20px !important;
}

.comment-textarea >>> textarea {
  font-size: 14px;
  line-height: 1.4;
}

.btn-container {
  padding-top: 8px;
  display: flex;
  align-items: center;
}

.custom-submit-btn {
  background: none;
  border: none;
  color: #0095f6;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  cursor: pointer;
  white-space: nowrap;
  min-width: 80px;
}

.custom-submit-btn:disabled {
  color: #b3dbf8;
  cursor: default;
}

.custom-submit-btn:hover:not(:disabled) {
  opacity: 0.8;
}

.comment-section {
  margin-top: 20px;
}

.comment-input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.comment-user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.comment-textarea {
  flex-grow: 1;
}

.custom-submit-btn {
  background: none;
  border: none;
  color: #0095f6;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 16px;
  cursor: pointer;
  white-space: nowrap;
}

.custom-submit-btn:disabled {
  color: #b3dbf8;
  cursor: default;
}

.comments-container {
  margin-top: 20px;
}

.comment-item {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.comment-info {
  flex-grow: 1;
}

.comment-author {
  font-weight: 600;
  font-size: 14px;
}

.comment-time {
  color: #666;
  font-size: 12px;
  margin-left: 8px;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
}

.action-btn.edit {
  color: #0095f6;
}

.action-btn.delete {
  color: #ed4956;
}

.comment-body {
  margin-left: 40px;
  margin-top: 8px;
}

.comment-text {
  font-size: 14px;
  line-height: 1.4;
}

.reply-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 12px;
  margin-top: 8px;
  cursor: pointer;
}

.reply-form {
  margin-left: 40px;
  margin-top: 12px;
}

.reply-wrapper {
  transform: scale(0.95);
  transform-origin: left top;
}

.replies-container {
  margin-left: 40px;
  margin-top: 12px;
  position: relative;
}

.replies-container::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #f0f0f0;
}

.reply-item {
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 8px;
}

.nested-replies-container {
  margin-left: 32px;
  margin-top: 8px;
  position: relative;
}

.nested-replies-container::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #f0f0f0;
}

.nested-reply-item {
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-top: 8px;
}

.nested-reply-form {
  margin-left: 32px;
  margin-top: 8px;
}

/* 프로젝트 정보 테이블 스타일 */
.project-info-table {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  padding: 8px 0;
  align-items: center;
}

.info-row:not(:last-child) {
  border-bottom: 1px solid #e9ecef;
}

.info-label {
  width: 80px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.info-value {
  flex: 1;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 12px;
}

.remaining-time {
  color: #9C27B0;
  font-weight: 500;
}

.status-tag {
  background-color: #E3F2FD;
  color: #1976D2;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.duration {
  color: #666;
  font-size: 13px;
}

.link-icon {
  transition: color 0.2s;
}

.link-icon:hover {
  color: #1976D2 !important;
  transform: scale(1.1);
}

.no-link {
  color: #999;
  font-style: italic;
  font-size: 13px;
}
</style>

