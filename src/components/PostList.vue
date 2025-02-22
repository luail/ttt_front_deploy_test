<template>
    <v-container fluid>
        <v-row>
            <!-- 사이드바 -->
            <v-col cols="1">
          <v-navigation-drawer permanent class="sidebar" width="180">
            <v-list>
              <v-list-item v-for="(c, index) in categoryList" :key="index" @click="selectedBoard(c.categoryId)" class="clickable-item">
                <v-list-item-content>
                  <v-list-item-title class="font-weight-bold">{{c.categoryName}}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-navigation-drawer>
        </v-col>

            <!-- 상단 배너 -->
            <v-row justify="center">
                 <v-col cols="12">
                    <div class="ad-banner">
                    <a href="https://www.inflearn.com/users/1014633/@bradkim" target="_blank">
                      <img :src="require('@/assets/tttad.png')" alt="" class="banner-img">
                    </a>
                    </div>
                 </v-col>
            </v-row>
           
            <!-- 게시물 리스트 -->
            <v-col cols="11" class="pl-0">
                <!-- 상단 메뉴 -->
                <v-row class="mb-5 align-center">
                    <v-col>
                        <h2 class="text-h5 font-weight-bold" style="margin-left: 140px;">{{ boardTitle }}</h2>
                    </v-col>

           <!-- 게시물 검색창 -->
            <v-col cols="6">
                <v-row align="center" class="search-container">
                    <!-- 검색 옵션 선택 -->
                    <v-col cols="3">
                        <v-select
                            v-model="searchType"
                            :items="searchOptions"
                            item-title="text"
                            item-value="value"
                            solo
                            rounded
                            hide-details
                            class="search-select"
                        ></v-select>
                    </v-col>
                   
                    <!-- 검색 입력창 -->
                    <v-col cols="7">
                        <v-text-field
                            v-model="searchKeyword"
                            label="검색어 입력"
                            solo
                            rounded
                            hide-details
                            clearable
                            class="search-input"
                        ></v-text-field>
                    </v-col>

                    <!-- 검색 버튼 -->
                    <v-col cols="2" class="d-flex justify-center">
                        <v-btn color="primary" class="search-btn text-white font-weight-bold" @click="searchPosts()">
                            <v-icon left>mdi-magnify</v-icon> 검색
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
                                    <!-- 첫 번째 줄: 프로필 이미지 & 닉네임 -->
                                    <v-row no-gutters class="align-center">
                                        <v-col cols="auto" class="d-flex align-center">
                                            <img 
                                                :src="post.authorImage || require('@/assets/basicProfileImage.png')" 
                                                class="rounded-square" 
                                            />
                                        </v-col>        
                                        <v-col class="user-info">
                                            <div class="nickname">{{ post.authorNickName }}</div>
                                            <div class="date">{{ formatDate(post.createdTime) }}</div>
                                        </v-col>
                                        
                                    </v-row>

                                    <!-- 두 번째 줄: 게시물 제목 -->
                                    <v-row no-gutters>
                                        <v-col>
                                            <div class="post-title">
                                                {{ post.title }}
                                            </div>
                                        </v-col>
                                    </v-row>

                                    <!-- 세 번째 줄: 게시물 내용 미리보기 -->
                                    <v-row no-gutters>
                                        <v-col>
                                            <div class="text-preview">
                                                {{ truncatedContent(removeHtmlTags(post.contents), 100) }}
                                            </div>
                                        </v-col>
                                    </v-row>

                                    <!-- 네 번째 줄: 게시물 메타정보 (댓글, 좋아요) -->
                                    <v-row no-gutters class="mt-4 align-center">
                                        <span class="mr-1" style="font-size: 20px;">👍 {{ post.likesCount }}</span>
                                        <!-- <v-icon class="mr-1" style="font-size: 25px;">mdi-thumb-up-outline</v-icon> {{ post.likesCount }} -->
                                        <span class="ml-4" style="font-size: 20px;">💬 {{ post.countOfComment }}</span>
                                        <!-- <v-icon class="ml-4 mr-1" style="font-size: 25px;">mdi-comment-outline</v-icon> {{ post.countOfComment }} -->
                                        <div class="ml-auto">{{ formatDate(post.createdTime) }}</div>
                                    </v-row>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>

                <!-- 페이지네이션 -->
                <v-pagination 
                    v-model="page" 
                    :length="totalPages" 
                    color="purple"
                    class="mt-5"
                    @update:modelValue="fetchPage"
                ></v-pagination>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

dayjs.extend(relativeTime);
dayjs.locale('ko');

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
            const beforeCategoryList=sideBarResponse.data.result;
            this.categoryList = [{categoryName: "전체게시판", categoryId:0},...beforeCategoryList]
            console.log(this.categoryList)

            //게시글 타이틀 가지고오기
            const boardId = this.$route.params.boardId
            if(boardId === '0'){
                this.boardTitle = '전체게시판';
            } else{
                const selectedCategory = this.categoryList.find(c=>c.categoryId === parseInt(boardId));
                console.log(selectedCategory)
                this.boardTitle = selectedCategory ? selectedCategory.categoryName : "게시판";
                
            }

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

            const boardId = this.$route.params.boardId;//현재 url에서 boardId값을 가져옴 
            console.log(boardId)
            let url = boardId === "0" ? `${process.env.VUE_APP_API_BASE_URL}/post/findAll?page=${this.page-1}&size=${this.size}`
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
            if(boardId === '0'){
                this.boardTitle = '전체게시판';
            } else{
                const selectedCategory = this.categoryList.find(c=>c.categoryId === parseInt(boardId));
                console.log(selectedCategory)
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
        formatDate(dateArray) {
            //이거는 createdTime이 배열값으로 들어오는지 확인하는 유효성 검사
            if(!dateArray || dateArray.length < 6 ) return '';
            //자바스크립트가 1월 부터 시작하는 것을 0월부터 인덱스로 인식해서 그걸 처리하는 값
            const formattedDate = dayjs(`${dateArray[0]}-${dateArray[1].toString().padStart(2, '0')}-${dateArray[2].toString().padStart(2, '0')}T${dateArray[3].toString().padStart(2, '0')}:${dateArray[4].toString().padStart(2, '0')}:${dateArray[5].toString().padStart(2, '0')}`);
            //24시간 이내면 몇시간전 이래 표시되고, 하루가 지나면 날짜로 표시됨
            return dayjs().diff(formattedDate,'hour')<24 ? formattedDate.fromNow() : formattedDate.format('YYYY-MM-DD');
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
            this.totalPages = response.data.result.totalPages; // 페이지네이션 업데이트!
            this.totalElements = response.data.result.totalElements;

            }catch(error){
                console.log("검색요청 실패",error);
            }
        },
        //페이지 변경
        async fetchPage(newPage){
            this.page = newPage
            await this.changeBoard();
        },
        //게시물 본문 미리보기
        truncatedContent(text, length) {
      if (!text) return ""; // text가 undefined일 경우 빈 문자열 반환
      return text.length > length ? text.slice(0, length) + "..." : text;
    },
       //퀼 편집기로 만들어진 html문자열을 dom객체로 변환하고 텍스트 콘텐츠만 가지고 오는 것
        removeHtmlTags(text){
            if(text){
                const doc = new DOMParser().parseFromString(text,"text/html");
                return doc.body.textContent || ""; //html태그 제거하고 텍스트만 가지고 오는 명령어
            } else{
                return"";
            }
        },
    
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
  width: 1400px; /* 전체 너비를 차지하도록 설정 */
  height: 300px; /* 원본 비율 유지 */
  display: block; /* 블록 요소로 설정하여 중앙 정렬 */
  margin-top: -40px;
  margin-right: 100px;
  margin-left: -60px;
  margin-bottom: 40px;
}

.banner-img:hover {
    box-shadow: 0 10px 20px rgba(4, 221, 109, 0.841);
    transform: translateY(-10px);
 
}

.clickable-item {
  cursor: pointer;
  transition: background-color 0.3s;
}

.clickable-item:hover {
    box-shadow: 0 5px 10px rgba(251, 251, 251, 0.966);
    transform: translateY(-5px);
}

.post-card {
    margin-left: 140px; /* 왼쪽 마진 */
    margin-right: 0px; /* 오른쪽 마진 최소화 */
    margin-bottom: 25px; /* 게시물 카드 간격 증가 */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    border-radius: 25px;
    transition: 0.3s;
}


.post-card:hover {
    box-shadow: 0 10px 20px rgba(242, 13, 169, 0.3);
    transform: translateY(-10px);
}

.post-title{
    margin-top: 20px;
    font-size: 30px;
    font-weight: bold;
    color: #333;

}

.text-preview {
  margin-top: 10px;
  margin-bottom: 10px;
  font-size: 20px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
}


.rounded-square {
  width: 60px;
  height: 60px;
  border-radius: 50px; /* 모서리를 둥글게 */
  object-fit: cover;
  border: 2px solid #ddd; /* 테두리 추가 (선택 사항) */
}

.text-right {
    text-align: right;
}

.profile-container {
  display: flex;
  align-items: flex-end;  /* 수정: center에서 flex-end로 변경하여 하단 정렬 */
  gap: 10px;
}

.user-info {
  display: flex;
  flex-direction: column;  /* 수정: row에서 column으로 변경하여 세로 배치 */
  gap: 4px;  /* 간격 조정 */
  margin-left: 10px;
  margin-top: 30px;
}

.nickname {
  font-size: 20px;
  font-weight: bold;  /* 닉네임을 더 강조하기 위해 추가 */
  margin-top:-20px;
}

.date {
  font-size: 15px;  /* 날짜 텍스트 크기를 약간 작게 조정 */
  color: #666;  /* 날짜 색상을 좀 더 연하게 설정 */
}

.search-container {
  background-color: white;  /* 부드러운 배경색 */
  padding: 10px 15px;
  border-radius: 15px;  /* 전체적으로 둥근 스타일 */
}

.search-select {
  background-color: white;
  border-radius: 10px;
}

.search-input {
  background-color: white;
  border-radius: 10px;
}

.search-btn {
  height: 50px;
  font-size: 16px;
  border-radius: 10px;  /* 버튼도 둥글게 */
}

</style>
