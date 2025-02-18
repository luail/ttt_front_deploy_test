<template>
  <v-container fluid class="page-container">
      <!-- 상단 배너 -->
      <v-row justify="center">
                 <v-col cols="12">
                    <div class="ad-banner">
                      <img :src="require('@/assets/kakaohadd.png')" alt="" class="banner-img">
                    </div>
                 </v-col>
            </v-row>

    <v-row>
      <!-- 사이드 메뉴 -->
     <!-- 사이드바 -->
     <v-col cols="1">
          <v-navigation-drawer permanent class="sidebar" width="180">
            <v-list>
              <v-list-item v-for="(c, index) in categoryList" :key="index" @click="selectedBoard(c.categoryId)" class="clickable-item">
                <v-list-item-content>
                  <v-list-item-title class="font-weight-bold" >{{c.categoryName}}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-navigation-drawer>
        </v-col>


      <!-- 게시물 상세 -->
      <v-col cols="10" v-if="thisPost">
        <v-card class="post-detail">
          <v-card-title>
            <div class="post-title">
              <img :src="thisPost.profileImageOfAuthor|| require('@/assets/basicProfileImage.png')" class="author-img"/>
              <div>
                <strong>{{ thisPost.authorNickName }}</strong>
                <v-icon class="ml-2" @click="gotoChat()">mdi-forum-outline</v-icon>
                <div class="post-meta">
                  <span class="author-rank">랭킹포인트 : {{ thisPost.rankingPointOfAuthor }}</span><br>
                  {{ formatDate(thisPost.createdTime) }}
                </div>
              </div>
            </div>
          </v-card-title>
          
          <v-divider></v-divider>
        
          <v-card-text class="post-content">
            {{ thisPost.contents }}
          </v-card-text>
          <v-card-actions class="like-container">
            <v-btn icon class="like-btn" @click="toggleLike()">
              <v-icon v-if="thisPost.liked">mdi-thumb-up</v-icon>
              <v-icon v-else>mdi-thumb-up-outline</v-icon>
            </v-btn>
            <div class="like-count">{{ thisPost.likesCount }}</div>
          </v-card-actions>
       

        <!-- 글 수정/삭제 버튼 (작성자만 보이게) -->
        <v-card-actions v-if="isAuthor" class="edit-delete-container">
            <v-btn color="blue" class="text-white" @click="editPost()">수정</v-btn>
            <v-btn color="red" class="text-white ml-2" @click="deletePost()">삭제</v-btn>
          </v-card-actions>
        </v-card>

       <!-- 댓글 입력창 -->
       <div class="comment-section">
          <h4>댓글</h4>
          <v-textarea v-model="newComment" placeholder="댓글을 입력하세요"></v-textarea>
          <v-btn color="primary" class="mt-2" @click="submitComment()">댓글 등록</v-btn>
          </div>

          <!-- 댓글 리스트 -->
        <div v-if="thisPost.commentList && thisPost.commentList.length > 0" class="comment-list">
          <div v-for="(comment, index) in thisPost.commentList" :key="index" class="comment-item">
            <img :src="comment.profileImageOfCommentAuthor || require('@/assets/basicProfileImage.png')" class="comment-author-img" alt="댓글 프로필" />
            <div class="comment-content">
              <strong>{{ comment.nickNameOfCommentAuthor }}</strong>
              <span class="comment-rank">{{ comment.rankingPointOfCommentAuthor }}</span>
              <div class="comment-time">{{ formatDate(comment.createdTime) }}</div>
              <div v-if="comment.loginIdOfCommentAuthor === userId" class="comment-actions">
                <v-btn color="blue" class="text-white" @click="editComment(comment)">수정</v-btn>
                <v-btn color="red" class="text-white ml-2" @click="deleteComment(comment.commentId)">삭제</v-btn>
              </div>
            <!-- 수정 중인 댓글이면 입력창 표시 -->
            <div v-if="editingCommentId == comment.commentId">
              <v-textarea v-model="editingCommentContent" dense auto-grow></v-textarea>
              <v-btn color="blue" class="text-white" @click="updateComment(comment.commentId)">수정</v-btn>
              <v-btn color="blue" class="text-white" @click="cancelEdit()">취소</v-btn>
            </div>
            <!-- 수정 누른 댓글이 아니라면 기존처럼 표시 -->
              <div v-else class="comment-text">{{ comment.contents }}
              <div class="again-comment" @click="toggleReply(comment.commentId)">+댓글등록</div>
              </div>


              
              <!-- 대댓글 입력창 (해당 댓글을 클릭했을 때만 보임) -->
            <div v-if="replyCommentVisible[comment.commentId]" class="reply-section">
              <v-textarea 
                v-model="newReply" 
                placeholder="대댓글을 입력하세요"
                outlined dense auto-grow
              ></v-textarea>
              <v-btn color="primary" class="mt-2" @click="createNewReply(comment.commentId)">대댓글 등록</v-btn>
            </div>
 

              <!-- 대댓글 리스트 -->
              <div v-if="comment.childCommentList && comment.childCommentList.length > 0" class="child-comments">
                <div v-for="(child, cIndex) in comment.childCommentList" :key="cIndex" class="child-comment-item">
                  <img :src="child.profileImageOfCommentAuthor || require('@/assets/basicProfileImage.png')" class="comment-author-img" alt="대댓글 프로필" />
                  <div class="comment-content">
                    <strong>{{ child.nickNameOfCommentAuthor }}</strong>
                    <span class="comment-rank">{{ child.rankingPointOfCommentAuthor }}</span>
                    <div class="comment-time">{{ formatDate(child.createdTime) }}</div>
                    <div v-if="comment.loginIdOfCommentAuthor === userId" class="comment-actions">
                      <v-btn color="blue" class="text-white" @click="editComment2(child.commentId)">수정</v-btn>
                      <v-btn color="red" class="text-white ml-2" @click="deleteComment2(child.commentId)">삭제</v-btn>
                    </div>
                    <div class="comment-text">{{ child.contents }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export default {
  data() {
    return {
      categoryList:[],
      thisPost:{},
      commetList:[],
      userId:'',
      newComment: '',
      replyComment: {}, // 대댓글을 저장하는 객체
      replyCommentVisible:{}, //댓글 id별로 대댓글 입력창을 켰는지 아닌지의 상태를 저장
      newReply:'',
      isAuthor:false, //글작성자와 본인이 동일한지 따지는 boolean객체->글 수정,삭제버튼 보이게 하기 위해
      isAuthorOfComment:false,
      originalComment:'',
      editingCommentId: null, // 수정중인 댓글ID
      editingCommentContent:'' // 수정중인 댓글의 내용
    
    }
    
    }
  ,

 async created() {
     // 카테고리 리스트 불러오기
     const sideBarResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/category/all`);
            this.categoryList = sideBarResponse.data.result;

      //상세 게시글 데이터 불러오기
      const thisPostId = this.$route.params.id;
      const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post/detail/${thisPostId}`);
      this.thisPost = response.data.result
      console.log(this.thisPost)

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
      formatDate(date) {
            return new Date(date).toLocaleDateString('ko-KR');
        },
      //왼쪽 사이드바 게시판 이동
        async selectedBoard(boardId){
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
      //게시물 작성
      async submitComment(){
        try{
          const idOfthisPost = this.$route.params.id
          const comment ={
          contents : this.newComment,
          postId : idOfthisPost
          }
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
        // 댓글 수정 제출 취소
        cancelEdit(){
        this.editingCommentId = null, 
        this.editingCommentContent= ' ' 
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
      //대댓글 달때 누르면 대댓글 입력창뜨도록
        toggleReply(commentId){
          this.replyCommentVisible ={
            ...this.replyCommentVisible,
            [commentId]: !this.replyCommentVisible[commentId]
          };
          },
     //대댓글 작성하기
      async createNewReply(commentId){
        try{
          const idOfthisPost = this.$route.params.id
          const reply ={
            contents : this.newReply,
            postId : idOfthisPost,
            parentId : commentId
          }
          await axios.post(`${process.env.VUE_APP_API_BASE_URL}/comment/create`,reply);
          window.location.reload();
        }catch(error){
          console.log("대댓글 달기 실패", error)
        }


         } 


        }  
        
      }
 

</script>

<style scoped>
.page-container {
  margin: 0 30px;
}

.ad-banner {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto; /* 좌우 여백 자동 조정 */
}

.banner-img {
  width: 1500px; /* 전체 너비를 차지하도록 설정 */
  height: 350px; /* 원본 비율 유지 */
  display: block; /* 블록 요소로 설정하여 중앙 정렬 */
  border-radius: 40px;
  margin-top: 0px;
  margin-right: 100px;
  margin-left:100px;
  margin-bottom: 20px;
}

.sidebar {
  background-color: #f4f4f4;
  border-right: 1px solid #ccc;
}

.post-detail {
  margin: 20px 0;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 60px;
  min-height: 600px;
}

.post-title {
  display: flex;
  align-items: center;
}

.author-img {
  width: 60px;
  height: 60px;
  border: 2px solid #d6cdf3;
  border-radius: 50%;
  margin-right: 15px;
}

.author-rank {
  font-size: 0.85em;
  color: #888;
}

.post-meta {
  font-size: 0.8em;
  color: #555;
}

.post-content {
  font-size: 1.4em;
  margin-top: 15px;
}

.like-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.like-btn {
  color: #4b3f72;
}

.like-count {
  margin-left: 2px;
  width: 35px;
  height: 35px;
  background-color: #eee;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.edit-delete-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.edit-delete-container v-btn {
  margin-left: 5px;
}


.comment-section {
  margin-top: 30px;
}

.comment-item {
  display: flex;
  margin-top: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 15px;
  background-color: #fafafa;
}

.comment-author-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.comment-content {
  flex: 1;
  position: relative; /* 부모 요소를 기준으로 위치 지정 */
  width: 100%;
}

.comment-actions {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 5px;
}

.comment-time {
  font-size: 0.75em;
  color: #888;
}

.comment-text {
  margin-top: 5px;
}

.reply-section {
  margin-top: 10px;
  padding-left: 50px;
}

.again-comment {
  color: blue;
  cursor: pointer;
  margin-top: 5px;
  font-size: 14px;
}

.child-comments {
  margin-top: 10px;
  padding-left: 50px;
}
</style>
