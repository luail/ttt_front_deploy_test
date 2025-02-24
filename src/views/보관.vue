<template>
  <v-container fluid class="page-container">
   <!-- 상단 배너 -->
   <v-row justify="center">
               <v-col cols="12">
                  <div class="ad-banner">
                    <img :src="require('@/assets/tttad.png')" alt="" class="banner-img">
                  </div>
               </v-col>
          </v-row>

    <v-row>
      <!-- 사이드 메뉴 -->
      <v-col cols="1">
        <v-navigation-drawer permanent class="sidebar" width="180">
          <v-list>
            <v-list-item v-for="(c, index) in categoryList" :key="index" @click="selectedBoard(c.categoryId)" class="clickable-item">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">{{ c.categoryName }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-navigation-drawer>
      </v-col>

      <!-- 게시물 수정 폼 -->
      <v-col cols="10">
        <v-card class="post-detail">
          <v-card-title>
            <v-container>
              <!-- 카테고리 선택 드롭다운 -->
              <v-select
                v-model="selectedCategoryId"
                :items="categoryList"
                item-title="categoryName"
                item-value="categoryId"
                label="게시판을 선택하세요"
              />

              <!-- 제목 입력 칸 -->
              <v-text-field v-model="title" label="제목을 입력하세요" outlined></v-text-field>
            </v-container>
          </v-card-title>
          
          <v-divider></v-divider>

          <!-- 게시물 본문 입력칸 -->
          <v-card-text class="post-content">
            <v-textarea
              v-model="contents"
              label="내용을 입력하세요"
              outlined
              rows="10"
              auto-grow
            ></v-textarea>
          </v-card-text>

          <!-- 이미지 업로드 -->
          <v-card-text>
            <v-file-input
              label="이미지 업로드"
              multiple
              accept="image/**"
              @change="fileUpload"
              outlined
            ></v-file-input>
          </v-card-text>

          <v-btn color="blue" class="secondary" @click="updatePost()">수정 완료</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
data() {
  return {
    categoryList: [],
    postId: null,
    selectedCategoryId: '',
    title: '',
    contents: '',
    attachments: [],
  };
},

async created() {
  try {
    // URL에서 postId 가져오기
    this.postId = this.$route.params.id;

    // 카테고리 리스트 불러오기
    const categoryResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/category/all`);
    this.categoryList = categoryResponse.data.result;

    // 기존 게시글 데이터 불러오기
    const postResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post/detail/${this.postId}`);
    const postData = postResponse.data.result;
    this.selectedCategoryId = postData.postCategoryId;
    this.title = postData.title;
    this.contents = postData.contents;
    this.existingAttachments = postData.attachments || []; // 기존 첨부 파일
  } catch (error) {
    console.error("게시글 불러오기 실패:", error);
  }
},

methods: {
  fileUpload(event) {
    this.attachments = Array.from(event.target.files); // 파일 리스트를 배열로 변환
  },

  async updatePost() {
   try{
      let formData = new FormData();
       formData.append("title",this.title);
       formData.append("contents",this.contents);
       
       this.attachments.forEach(file => {
          formData.append("attachments",file);
       });

       const response = await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/post/update/${this.postId}`,formData,
       {
          headers:{
              "Content-Type": "multipart/form-data"
          }
       }
       )
       console.log(response);
       this.$router.push(`/ttt/post/${this.postId}`);


   }catch(error){
      console.log("수정실패",error)
   }
  },

  async selectedBoard(boardId){
          this.$router.push(`/ttt/post/list/${boardId}`);
      },
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
margin-bottom: 40px;
}

.sidebar {
background-color: #f4f4f4;
border-right: 1px solid #ccc;
}

.post-detail {
margin: 20px 0;
border: 1px solid #ccc;
border-radius: 10px;
padding: 20px;
}
</style>
