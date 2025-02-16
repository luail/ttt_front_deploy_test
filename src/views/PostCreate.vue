<template>
    <v-container fluid class="page-container">
      <!-- 광고 배너 -->
      <v-row>
        <v-col>
          <div class="ad-banner">
            BEYOND SW CAMP와 함께 성장 가능성 있는 개발자로 취업하세요.
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
                  <v-list-item-title class="font-weight-bold" >{{c.categoryName}}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-navigation-drawer>
        </v-col>
  
        <!-- 게시물 작성 폼 -->
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
            <v-btn color="yellow" class="secondary" @click="postCreate()">제출</v-btn>
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
        categoryList:[],
        selectedCategoryId: '',
        title: '',
        contents: '',
        attachments: [],
        postCreateDto: {}
      };
    },
  
    async created() {
      try {
        const sideBarResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/category/all`);
        this.categoryList = sideBarResponse.data.result
        console.log(this.categoryList)
      } catch (error) {
        console.error('카테고리 불러오기 실패:', error);
      }
    },

    methods:{
        fileUpload(event){
            this.attachments = Array.from(event.target.files); //파일리스트를 배열로 변환
        },
        
        async postCreate() {
        try {
            // FormData 객체 생성
            let formData = new FormData();

            // 텍스트 데이터 추가
            formData.append("title", this.title);
            formData.append("contents", this.contents);
            formData.append("postCategoryId", this.selectedCategoryId);

            // 파일 데이터 추가 (여러 개일 경우)
            this.attachments.forEach(file => {
                formData.append("attachments", file);
            });

            // axios 요청 전송
            const response = await axios.post(
                `${process.env.VUE_APP_API_BASE_URL}/post/create`, 
                formData, 
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            console.log("게시물 생성 성공:", response.data);
            this.$router.push(`/ttt/post/list/all`);
        } catch (error) {
            console.log('게시물 생성 실패:', error);
        }
    },


  }
}

  </script>
  
  <style scoped>
  .page-container {
    margin: 0 30px;
  }
  
  .ad-banner {
    height: 150px;
    background-color: #4b3f72;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;
    font-weight: bold;
    border-radius: 50px;
    margin: 20px 10;
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
