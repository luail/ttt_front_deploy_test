<template>
    <v-container fluid>
        <v-row>
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

            <!-- 상단 배너 -->
            <v-row justify="center">
                 <v-col cols="12">
                    <div class="ad-banner">
                      <img :src="require('@/assets/tttad.png')" alt="" class="banner-img">
                    </div>
                 </v-col>
            </v-row>
           
            <!-- 게시물 리스트 -->
            <v-col cols="11" class="pl-0">
                <!-- 상단 메뉴 -->
                <v-row class="mb-5 align-center">
                    <v-col>
                        <h2 class="text-h4 font-weight-bold">{{ boardTitle }}</h2>
                    </v-col>

           <!-- 게시물 검색창 -->
          <v-col cols="6">
                <v-row align="center">
                    <!-- 검색 옵션 선택 -->
                    <v-col cols="3">
                         <v-select
                          v-model="searchType"
                          :items="searchOptions"
                          item-title="text"
                          item-value="value"
                          outlined
                          dense
                         ></v-select>
                         </v-col>
                            <!-- 검색 입력창 -->
                        <v-col cols="7">
                             <v-text-field
                                    v-model="searchKeyword"
                                    label="검색어 입력"
                                    outlined
                                    dense
                                    clearable
                            ></v-text-field>
                        </v-col>

                    <!-- 검색 버튼 -->
                            <v-col cols="2">
                                <v-btn color="primary" class="text-white font-weight-bold" @click="searchPosts">
                                    검색
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-col>
                  <!-- 글 작성하기 버튼 -->
                    <v-col class="text-right">
                        <v-btn color="primary" class="text-white font-weight-bold" @click="createPost">+ 글쓰기</v-btn>
                    </v-col>
                </v-row>


                <!-- 게시글 카드 리스트 -->
                <v-row>
                    <v-col v-for="post in postList" :key="post.postId" cols="12">
                        <v-card class="mb-4 post-card" @click="goToDetailPost(post.postId)">
                            <v-card-text>
                                <v-row no-gutters class="align-center">
                                    <!-- 프로필 이미지 -->
                                    <v-col cols="1" class="d-flex justify-center align-center">
                                        <img 
                                            :src="post.authorImage || require('@/assets/basicProfileImage.png')" 
                                            class="rounded-circle" 
                                            style="width: 60px; height: 60px; object-fit: cover;"
                                        />
                                    </v-col>

                                    <!-- 게시물 내용 -->
                                    <v-col cols="11" class="pl-2">
                                        <!-- 게시물 제목 -->
                                        <div class="text-h5 mt-1">{{ post.title }}</div>
                                        <!-- 작성자 이름 -->
                                        <div class="font-weight-bold text-body-3">{{ post.authorNickName }}</div>
                                        <!-- 게시물 내용 -->
                                        <div class="text-body-2 text--secondary">{{ post.content }}</div>

                                        <!-- 태그 리스트 -->
                                        <div class="mt-3">
                                            <v-chip 
                                                v-for="(tag, i) in post.tags" 
                                                :key="i" 
                                                color="grey lighten-3" 
                                                class="mr-2"
                                            >
                                                {{ tag }}
                                            </v-chip>
                                        </div>

                                        <!-- 게시물 메타정보 (댓글, 좋아요) -->
                                        <div class="mt-4 d-flex align-center">
                                            <v-icon class="mr-2">mdi-thumb-up-outline</v-icon> {{ post.likesCount }}
                                            <v-icon class="ml-5 mr-2">mdi-comment-outline</v-icon> {{ post.countOfComment }}
                                            <div class="ml-auto">{{ formatDate(post.createdTime) }}</div>
                                        </div>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- 페이지네이션 -->
                <v-pagination 
                    v-model="page" 
                    :length="totalPages" 
                    color="primary"
                    class="mt-5"
                    @update:modelValue="fetchPage"
                ></v-pagination>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            postList: [],
            categoryList: [],
            page: 1, //페이지 처리
            size:20, //페이지 처리
            totalPages:1, //페이지 처리
            totalElements:0, //페이지 처리
            boardTitle:"",
            searchType:"optional",
            searchOptions:[{text:"선택", value:"optional"},{text:"제목", value:"title"},{text:"내용",value:"contents"}],
            searchKeyword:"",
          
        }
    },
    async created() {
        try {
            // 게시글 데이터 불러오기
            await this.changeBoard();

            // 카테고리 리스트 불러오기
            const sideBarResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/category/all`);
            this.categoryList = sideBarResponse.data.result;
            console.log(this.categoryList)

        } catch (error) {
            console.error('데이터 로드 실패:', error);
        }
    },


        watch:{ //현재 url에서 boardId가 바뀌면, 그 동작을 감지하고 changeBoard함수를 실행하여 해당 게시판의 데이터를 다시 불러오는 기능을 실행
            '$route.params.boardId':async function () {
                this.page =1; //새로운 게시판을 클릭하면 첫 페이지로 가야하니까
                await this.changeBoard();   
            }
        },


    methods: {
        //페이지 열자마자 실행되는 함수 해당 게시판에 맞는 데이터 불러오기.전체게시판이면 모든 글, 특정 게시판이면  해당 게시판에 맞는 글
        async changeBoard(){

            const boardId = this.$route.params.boardId || "all";//현재 url에서 boardId값을 가져옴 없다면 all로 설정
            let url = boardId === "all" ? `${process.env.VUE_APP_API_BASE_URL}/post/findAll?page=${this.page-1}&size=${this.size}`
                                        : `${process.env.VUE_APP_API_BASE_URL}/post/category/${boardId}?page=${this.page - 1}&size=${this.size}`;
            try{
                const response = await axios.get(url);
                console.log(response)
                this.postList = response.data.result.content;
                this.totalPages = response.data.result.totalPages;
                this.totalElements = response.data.result.totalElements;
            }catch(error){
                console.log("게시글 로딩 실패",error)
            }
            if(boardId === "all"){
                this.boardTitle = '전체게시판';
            } else{
                const selectedCategory = this.categoryList.find(c=>c.categoryId === parseInt(boardId));
                this.boardTitle = selectedCategory ? selectedCategory.categoryName : "게시판";
                
            }
        },
        //게시물 누르면 해당 상세게시물페이지로 이동
        goToDetailPost(postId) {
            this.$router.push(`/ttt/post/${postId}`);
        },
        //작성하기 버튼 누르면 작성페이지로 이동
        createPost() {
            this.$router.push('/ttt/post/create');
        },
        //날짜 데이터 형식 변화
        formatDate(date) {
            return new Date(date).toLocaleDateString('ko-KR');
        },
        //사이드 바에서 게시판 눌러이동
        async selectedBoard(boardId){
            this.$router.push(`/ttt/post/list/${boardId}`);
        },
        //게시물 검색
        async searchPosts(){
            this.page =1; //검색시 페이지 초기화
            this.postList = [];

            try{
                let params = {};
            if(this.searchType === "title"){
                params.title = this.searchKeyword;
            } else if(this.searchType === "contents"){
                params.contents = this.searchKeyword;
            }
            console.log(params)
            const response =  await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post/find`,{params});
            this.postList = response.data.result.content;

            }catch(error){
                console.log("검색요청 실패",error);
            }
        },
        //페이지 변경
        async fetchPage(newPage){
            this.page = newPage
            await this.changeBoard();
        }




    }
    }

</script>

<style scoped>
.sidebar {
    background-color: #f5f5f5;
    border-right: 1px solid #ccc;
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

.clickable-item {
  cursor: pointer;
  transition: background-color 0.3s;
}

.clickable-item:hover {
  background-color: #f0f0f0;
}

.post-card {
    
    margin-left: 140px; /* 왼쪽 마진 추가 */
    margin-right: 0px; /* 오른쪽 마진 최소화 */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    border-radius: 25px;
}

.rounded-circle {
    border-radius: 50%;
    border: 2px solid #ccc;
}

.text-right {
    text-align: right;
}

.v-list-item {
    text-align: left;
    padding-left: 20px;
}
</style>
