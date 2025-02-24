<template>
  <v-container class="pt-0">
    <v-row>
      <!-- 왼쪽 사이드바 -->
      <v-col cols="2">
        <div class="category-sidebar">
          <h3 class="sidebar-title">카테고리</h3>
          <v-list class="category-list pa-0">
            <v-list-item
              v-for="category in categoryList"
              :key="category.categoryId"
              @click="selectedBoard(category.categoryId)"
              :class="{ 'active-category': category.categoryId === selectedCategory }"
              class="category-item"
              dense
            >
              <v-list-item-content>
                <v-list-item-title 
                  :class="{ 'selected-text': category.categoryId === selectedCategory }"
                >
                  {{ category.categoryName }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </div>
      </v-col>

      <!-- 메인 컨텐츠 -->
      <v-col cols="8">
        <v-card class="post-container">
          <!-- 게시글 헤더 -->
          <div class="post-header pa-6">
            <div class="d-flex">
              <div class="category-tag">{{ thisPost.categoryName || 'Q&A' }}</div>
            </div>
            
            <div class="d-flex align-center mt-4">
              <v-avatar size="36" class="mr-3">
                <v-img
                  :src="thisPost.profileImageOfAuthor || require('@/assets/basicProfileImage.png')"
                  :alt="thisPost.authorNickName"
                  class="profile-image"
                ></v-img>
              </v-avatar>
              <div>
                <div class="author-name">{{ thisPost.authorNickName }}</div>
                <div class="post-meta">
                  {{ formatDate(thisPost.createdTime) }} · 조회 {{ thisPost.viewCount || 0 }}
                </div>
              </div>
            </div>
          </div>

          <!-- 게시글 제목 -->
          <div class="post-title pa-6 pb-2">
            <h1>{{ thisPost.title }}</h1>
          </div>

          <!-- 게시글 내용 -->
          <div class="post-content pa-6" v-html="thisPost.contents"></div>

          <!-- 좋아요 & 공유 버튼 -->
          <v-card-actions class="post-actions pa-6">
            <v-btn
              text
              :color="thisPost.liked ? 'primary' : ''"
              @click="toggleLike"
              class="like-btn"
            >
              <v-icon left>{{ thisPost.liked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline' }}</v-icon>
              {{ thisPost.likesCount || 0 }}
            </v-btn>
          </v-card-actions>

          <!-- 댓글 섹션 -->
          <v-divider></v-divider>
          
          <div class="comments-section pa-6">
            <div class="comments-header mb-4">
              <h3>{{ thisPost.commentList ? thisPost.commentList.length : 0 }}개의 댓글</h3>
            </div>

            <v-textarea
              v-model="newComment"
              outlined
              placeholder="댓글을 작성하세요"
              hide-details
              class="mb-3"
            ></v-textarea>
            
            <div class="d-flex justify-end mb-6">
              <v-btn color="primary" @click="submitComment">댓글 작성</v-btn>
            </div>

            <!-- 댓글 목록 -->
            <div v-if="thisPost.commentList && thisPost.commentList.length > 0" class="comments-list">
              <div v-for="comment in thisPost.commentList" :key="comment.commentId" class="comment-item">
                <div class="d-flex">
                  <v-avatar size="40" class="mr-3">
                    <v-img
                      :src="comment.profileImageOfCommentAuthor || require('@/assets/basicProfileImage.png')"
                      :alt="comment.nickNameOfCommentAuthor"
                      class="profile-image"
                    ></v-img>
                  </v-avatar>
                  <div class="comment-content">
                    <div class="comment-author">{{ comment.nickNameOfCommentAuthor }}</div>
                    <div class="comment-meta">{{ formatDate(comment.createdTime) }}</div>
                    <div class="comment-text">
                      {{ comment.contents }}
                      <!-- 답글달기 버튼 -->
                      <div class="reply-actions mt-2">
                        <v-btn text small color="primary" @click="showReplyForm(comment.commentId)">
                          <v-icon small class="mr-1">mdi-reply</v-icon>
                          답글달기
                        </v-btn>
                      </div>
                    </div>

                    <!-- 답글 입력 폼 -->
                    <div v-if="activeReplyId === comment.commentId" class="reply-form mt-3">
                      <v-textarea
                        v-model="newReply"
                        outlined
                        dense
                        rows="3"
                        hide-details
                        placeholder="답글을 입력하세요"
                        class="mb-2"
                      ></v-textarea>
                      <div class="d-flex justify-end mt-2">
                        <v-btn text class="mr-2" @click="hideReplyForm">취소</v-btn>
                        <v-btn color="primary" @click="submitReply(comment.commentId)">답글 작성</v-btn>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 대댓글 목록 -->
                <div v-if="comment.childCommentList && comment.childCommentList.length > 0" class="child-comments">
                  <div v-for="child in comment.childCommentList" :key="child.commentId" class="child-comment-item">
                    <div class="d-flex">
                      <v-avatar size="36" class="mr-3">
                        <v-img
                          :src="child.profileImageOfCommentAuthor || require('@/assets/basicProfileImage.png')"
                          :alt="child.nickNameOfCommentAuthor"
                          class="profile-image"
                        ></v-img>
                      </v-avatar>
                      <div class="child-comment-content">
                        <div class="comment-author">{{ child.nickNameOfCommentAuthor }}</div>
                        <div class="comment-meta">{{ formatDate(child.createdTime) }}</div>
                        <div class="comment-text">
                          {{ child.contents }}
                          <!-- 대댓글의 답글달기 버튼 -->
                          <div class="reply-actions mt-2">
                            <v-btn text small color="primary" @click="showReplyForm(child.commentId)">
                              <v-icon small class="mr-1">mdi-reply</v-icon>
                              답글달기
                            </v-btn>
                          </div>
                        </div>

                        <!-- 대댓글의 답글 입력 폼 -->
                        <div v-if="activeReplyId === child.commentId" class="reply-form mt-3">
                          <v-textarea
                            v-model="newReply"
                            outlined
                            dense
                            rows="3"
                            hide-details
                            placeholder="답글을 입력하세요"
                            class="mb-2"
                          ></v-textarea>
                          <div class="d-flex justify-end mt-2">
                            <v-btn text class="mr-2" @click="hideReplyForm">취소</v-btn>
                            <v-btn color="primary" @click="submitReply(child.commentId)">답글 작성</v-btn>
                          </div>
                        </div>

                        <!-- 대대댓글 목록 -->
                        <div v-if="child.childCommentList && child.childCommentList.length > 0" class="grandchild-comments">
                          <div v-for="grandchild in child.childCommentList" :key="grandchild.commentId" class="grandchild-comment-item">
                            <div class="d-flex">
                              <v-avatar size="32" class="mr-3">
                                <v-img
                                  :src="grandchild.profileImageOfCommentAuthor || require('@/assets/basicProfileImage.png')"
                                  :alt="grandchild.nickNameOfCommentAuthor"
                                  class="profile-image"
                                ></v-img>
                              </v-avatar>
                              <div class="grandchild-comment-content">
                                <div class="comment-author">{{ grandchild.nickNameOfCommentAuthor }}</div>
                                <div class="comment-meta">{{ formatDate(grandchild.createdTime) }}</div>
                                <div class="comment-text">{{ grandchild.contents }}</div>
                              </div>
                            </div>
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
      categoryList:[],
      thisPost:{},
      commetList:[],
      userId:'',
      newComment: '',
      activeReplyId: null, // 현재 활성화된 답글 폼의 댓글 ID
      newReply: '',
      isAuthor:false, //글작성자와 본인이 동일한지 따지는 boolean객체->글 수정,삭제버튼 보이게 하기 위해
      isAuthorOfComment:false,
      originalComment:'',
      editingCommentId: null, // 수정중인 댓글ID
      editingCommentContent:'', // 수정중인 댓글의 내용
      editingCommentId2: null,
      editingCommentContent2:'',
      editingCommentId3: null,
      editingCommentContent3:'',
    }
    
    }
  ,

 async created() {
     // 카테고리 리스트 불러오기
     const sideBarResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/category/all`);
     const beforeCategoryList= sideBarResponse.data.result;       
     this.categoryList = [{categoryName: "전체게시판", categoryId:0},...beforeCategoryList] 

      //상세 게시글 데이터 불러오기
      const thisPostId = this.$route.params.id;
      const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post/detail/${thisPostId}`);
      this.thisPost = response.data.result
     
      // 현재 로그인한 사람과 글작성자와 동일하다면 isAuthor값을 t로 바꾸어 글수정,삭제버튼이 보이게 한다
      const token = localStorage.getItem('token')
      if(token) {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.sub
        this.userId = userId;
        if(this.thisPost.authorId === userId){
          this.isAuthor =true;
        }
      }
      },

      

  methods: {
      //프로필 이미지에 보이는 날짜 형식 수정
      formatDate(dateArray) {
           //이거는 createdTime이 배열값으로 들어오는지 확인하는 유효성 검사
           if(!dateArray || dateArray.length < 6 ) return '';
            //자바스크립트가 1월 부터 시작하는 것을 0월부터 인덱스로 인식해서 그걸 처리하는 값
            const formattedDate = dayjs(`${dateArray[0]}-${dateArray[1].toString().padStart(2, '0')}-${dateArray[2].toString().padStart(2, '0')}T${dateArray[3].toString().padStart(2, '0')}:${dateArray[4].toString().padStart(2, '0')}:${dateArray[5].toString().padStart(2, '0')}`);
            //24시간 이내면 몇시간전 이래 표시되고, 하루가 지나면 날짜로 표시됨
            return dayjs().diff(formattedDate,'hour')<24 ? formattedDate.fromNow() : formattedDate.format('YYYY-MM-DD');
        },
      //왼쪽 사이드바 게시판 이동
       selectedBoard(boardId){  
        this.$router.push(`/ttt/post/list/${boardId}`);

        },

      // 좋아요 누르면, 아이콘 색깔, 좋아요 개수 변화
      async toggleLike(){
        try{
          const postId = this.$route.params.id
            const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/Likes/add/${postId}`);
            console.log(response);
            this.thisPost.liked=response.data.result.liked;
            this.thisPost.likesCount=response.data.result.likesCount;
        }catch(error){
           console.log("좋아요 실패",error);
        }  
      },
      //댓글작성
      async submitComment(){
        try{
          const idOfthisPost = this.$route.params.id //포스트 아이디
          const comment ={
          contents : this.newComment,
          postId : idOfthisPost 
          } //백엔드 CommentCreateDto랑 매핑
         const commentRes = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/comment/create`,comment);
         console.log(commentRes);
         window.location.reload();
        }catch(error){
          console.log("댓글생성 실패",error);
        }
        },
        //게시물 수정
        editPost(){
          const postId = this.$route.params.id
          this.$router.push(`/ttt/post/update/${postId}`)

        },
        //게시물 삭제
        async deletePost(){
          const recheck = confirm("정말로 삭제하시겠습니까?");
          if(recheck){
            try{
          const postId = this.$route.params.id
             await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/post/delete/${postId}`);
             this.$router.push(`/ttt/post/list/all`)
            }catch(error){
              console.log("삭제실패",error)
              }  
            }return
        },
        //댓글 수정
        editComment(comment){
         this.editingCommentId = comment.commentId //null값이 었던 editingCommentId에 값이 부여되고 댓글 아이디와 일치하는 조건이 true가 되면서 댓글 수정창이 열림
         this.editingCommentContent = comment.contents 
        },

        editComment2(comment){
         this.editingCommentId2 = comment.commentId //null값이 었던 editingCommentId에 값이 부여되고 댓글 아이디와 일치하는 조건이 true가 되면서 댓글 수정창이 열림
         this.editingCommentContent2 = comment.contents 
        },

        editComment3(comment){
         this.editingCommentId3 = comment.commentId //null값이 었던 editingCommentId에 값이 부여되고 댓글 아이디와 일치하는 조건이 true가 되면서 댓글 수정창이 열림
         this.editingCommentContent3 = comment.contents 
        },
        //  댓글 수정 제출
        async updateComment(commentId){
          const updatedComment={
              contents : this.editingCommentContent
            }
        try{
          await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/comment/update/${commentId}`,updatedComment);
          this.editingCommentId =null;
          this.editingCommentContent = ''; //다시 원상복구
          this.refreshPost() //수정 완료했으니 댓글리스트를 새로 갱신
        } catch(error){
          console.log("댓글수정실패",error)
        }
        },

        async updateComment2(commentId){
          const updatedComment2={
              contents : this.editingCommentContent2
            }
        try{
          await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/comment/update/${commentId}`,updatedComment2);
          this.editingCommentId =null;
          this.editingCommentContent = ''; //다시 원상복구
          this.refreshPost() //수정 완료했으니 댓글리스트를 새로 갱신
          window.location.reload(); // 위에 refreshPost작동되지 않아 새로고침. 시간남으면 수정...
        } catch(error){
          console.log("댓글수정실패",error)
        }
        },

        async updateComment3(commentId){
          const updatedComment3={
              contents : this.editingCommentContent3
            }
        try{
          await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/comment/update/${commentId}`,updatedComment3);
          this.editingCommentId =null;
          this.editingCommentContent = ''; //다시 원상복구
          this.refreshPost() //수정 완료했으니 댓글리스트를 새로 갱신
          window.location.reload(); // 위에 refreshPost작동되지 않아 새로고침. 시간남으면 수정...
        } catch(error){
          console.log("댓글수정실패",error)
        }
        },

        // 댓글 수정 제출 취소
        cancelEdit(){
        this.editingCommentId = null, 
        this.editingCommentContent= ' ' 
        },
        cancelEdit2(){
        this.editingCommentId2 = null, 
        this.editingCommentContent2= ' ' 
        },
        cancelEdit3(){
        this.editingCommentId3 = null, 
        this.editingCommentContent3= ' ' 
        },
        //댓글 삭제
        async deleteComment(commentId){
          const rechek = confirm("정말로 삭제하시겠습니까?");
          if(rechek){
            try{
              await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/comment/delete/${commentId}`);
              window.location.reload();
            }catch(error){
              console.log("댓글삭제 실패",error)
            }
          }
        },

        async refreshPost(){
          const thisPostId = this.$route.params.id
          const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post/detail/${thisPostId}`);
          this.thisPost = response.data.result;
        },
       
        //대댓글 삭제
        async deleteComment2(commentId){
          const rechek = confirm("정말로 삭제하시겠습니까?");
          if(rechek){
            try{
              await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/comment/delete/${commentId}`);
              window.location.reload();
            }catch(error){
              console.log("댓글삭제 실패",error)
            }
          }
        },

        async deleteComment3(commentId){
          const rechek = confirm("정말로 삭제하시겠습니까?");
          if(rechek){
            try{
              await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/comment/delete/${commentId}`);
              window.location.reload();
            }catch(error){
              console.log("댓글삭제 실패",error)
            }
          }
        },
      //대댓글 달때 누르면 대댓글 입력창뜨도록
        toggleReply(commentId){
          this.activeReplyId = commentId;
          this.newReply = '';
        },
     //대댓글 작성하기
      async submitReply(commentId) {
        try {
          if (!this.newReply.trim()) {
            alert('답글 내용을 입력해주세요.');
            return;
          }

          const reply = {
            contents: this.newReply,
            postId: this.$route.params.id,
            parentId: commentId
          };

          await axios.post(`${process.env.VUE_APP_API_BASE_URL}/comment/create`, reply);
          
          // 폼 초기화 및 숨기기
          this.hideReplyForm();
          
          // 댓글 목록 새로고침
          await this.refreshPost();
        } catch (error) {
          console.error('답글 작성 실패:', error);
          alert('답글 작성에 실패했습니다.');
        }
      },

      // 답글 폼 숨기기
      hideReplyForm() {
        this.activeReplyId = null;
        this.newReply = '';
      },

      // 답글 폼 표시
      showReplyForm(commentId) {
        this.activeReplyId = commentId;
        this.newReply = '';
      },

      async gotoChat(otherUserId) {
        console.log(this.post)
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chat/room/private/create?otherUserId=${otherUserId}`) 
        const roomId = response.data.result;
        this.$router.push(`/ttt/chatpage/${roomId}`)
      } 
    }
}
</script>

<style scoped>
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
  margin-bottom: 20px;
  padding: 16px;
  border-radius: 8px;
  background: #fff;
}

.child-comments {
  margin-left: 48px;
  margin-top: 16px;
  border-left: 2px solid #e2e8f0;
  padding-left: 16px;
}

.grandchild-comments {
  margin-left: 32px;
  margin-top: 12px;
  border-left: 2px solid #e2e8f0;
  padding-left: 16px;
}

.child-comment-item, .grandchild-comment-item {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.comment-author {
  font-weight: 600;
  margin-bottom: 4px;
}

.comment-meta {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
}

.reply-section {
  margin-top: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.reply-btn {
  text-transform: none !important;
  letter-spacing: normal !important;
}

.again-comment {
  margin-top: 8px;
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
</style>

