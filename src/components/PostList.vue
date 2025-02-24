<template>
    <v-container fluid class="main-container">
        <!-- 사이드바 -->
        <v-row>
            <v-col cols="2">
                <div class="category-sidebar">
                    <div class="category-title">카테고리</div>
                    <div 
                        v-for="(c, index) in categoryList" 
                        :key="index" 
                        @click="selectedBoard(c.categoryId)"
                        class="category-item"
                        :class="{ 'active': c.categoryId === currentCategoryId }"
                    >
                        {{ c.categoryName }}
                    </div>
                </div>
            </v-col>

            <v-col cols="8">
                <!-- 상단 배너 -->
                <div class="banner-container">
                    <a href="https://www.inflearn.com/users/1014633/@bradkim" target="_blank">
                        <img :src="require('@/assets/tttad.png')" alt="" class="banner-img">
                    </a>
                </div>

                <!-- 게시판 헤더 -->
                <div class="board-header">
                    <h2 class="board-title">{{ boardTitle }}</h2>
                    
                    <div class="search-area">
                        <select v-model="searchType" class="search-select">
                            <option v-for="option in searchOptions" 
                                    :key="option.value" 
                                    :value="option.value">
                                {{ option.text }}
                            </option>
                        </select>
                        <input 
                            v-model="searchKeyword"
                            type="text"
                            placeholder="검색어를 입력하세요"
                            class="search-input"
                            @keyup.enter="searchPosts"
                        >
                        <button @click="searchPosts" class="search-btn">
                            검색
                        </button>
                    </div>

                    <button @click="createPost" class="write-btn">
                        <v-icon small color="white">mdi-pencil</v-icon>
                        글쓰기
                    </button>
                </div>

                <!-- 게시글 목록 -->
                <div class="post-list">
                    <div v-for="post in postList" 
                         :key="post.postId" 
                         class="post-item"
                         @click="goToDetailPost(post.postId)">
                        <div class="post-header">
                            <div class="author-info">
                                <img 
                                    :src="post.authorImage || require('@/assets/basicProfileImage.png')"
                                    class="author-image"
                                >
                                <span class="author-name">
                                    {{ post.authorNickName }}
                                    <span class="rank-icon" :title="getRankTitle(post.authorRankingPoint)">
                                        {{ getRankIcon(post.authorRankingPoint) }}
                                    </span>
                                </span>
                                <span class="post-date">{{ formatDate(post.createdTime) }}</span>
                            </div>
                        </div>

                        <div class="post-content">
                            <h3 class="post-title">{{ post.title }}</h3>
                            <p class="post-preview">{{ truncatedContent(removeHtmlTags(post.contents), 100) }}</p>
                        </div>

                        <div class="post-footer">
                            <div class="post-stats">
                                <span>👀 {{ post.viewCount }}</span>
                                <span>👍 {{ post.likesCount }}</span>
                                <span>💬 {{ post.countOfComment }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 페이지네이션 -->
                <v-pagination
                    v-model="page"
                    :length="totalPages"
                    @update:modelValue="fetchPage"
                    class="pagination"
                ></v-pagination>
            </v-col>

            <!-- 새로 추가하는 오른쪽 배너 (2칸) -->
            <v-col cols="2" class="sidebar-col">
                <div class="sticky-sidebar">
                    <div class="ad-banner">
                        <a href="https://www.inflearn.com/users/1014633/@bradkim" target="_blank">
                            <img :src="require('@/assets/verticalbanner2.png')" alt="" class="banner-img2">
                        </a>
                    </div>
                </div>
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
            page: 1,
            size: 20,
            totalPages: 1,
            totalElements: 0,
            boardTitle: "",
            searchType: "optional",
            searchOptions: [
                {text: "선택", value: "optional"},
                {text: "제목", value: "title"},
                {text: "내용", value: "contents"}
            ],
            searchKeyword: "",
            currentCategoryId: 0
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
        getRankIcon(points) {
            if (!points) return '🌱'; // 포인트가 없는 경우 새싹
            if (points >= 500) return '🏆'; // 금메달
            if (points >= 300) return '🥈'; // 은메달
            if (points >= 100) return '🥉'; // 동메달
            return '🌱'; // 새싹
        },
        getRankTitle(points) {
            if (!points) return '새싹';
            if (points >= 500) return '골드 등급';
            if (points >= 300) return '실버 등급';
            if (points >= 100) return '브론즈 등급';
            return '새싹';
        }
    }
    }

</script>

<style scoped>
.main-container {
    background-color: #f8f9fa;
    min-height: 100vh;
    padding: 20px;
}

/* 카테고리 사이드바 */
.category-sidebar {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    position: -webkit-sticky;  /* Safari 지원 */
    position: sticky;
    top: 64px;                /* 상단에서의 간격 */
    height: fit-content;
    z-index: 10;
}

.category-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #7c3aed;
}

.category-item {
    padding: 12px 15px;
    cursor: pointer;
    border-radius: 6px;
    margin-bottom: 5px;
    transition: all 0.2s;
}

.category-item:hover {
    background: #f8f9fa;
    color: #7c3aed;
}

.category-item.active {
    background: #7c3aed;
    color: white;
}

/* 배너 */
.banner-container {
    margin-bottom: 30px;
}

.banner-img {
    width: 100%;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* 게시판 헤더 */
.board-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.board-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
}

/* 검색 영역 */
.search-area {
    display: flex;
    gap: 10px;
    flex: 1;
    max-width: 600px;
    margin: 0 20px;
}

.search-select {
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: white;
}

.search-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
}

.search-btn, .write-btn {
    padding: 8px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
}

.search-btn {
    background: #7c3aed;
    color: white;
}

.write-btn {
    background: #7c3aed;
    color: white;
}

.search-btn:hover, .write-btn:hover {
    opacity: 0.9;
}

/* 게시글 목록 */
.post-list {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.post-item {
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
    cursor: pointer;
    transition: all 0.2s;
}

.post-item:hover {
    background: #f8f9fa;
}

.post-header {
    margin-bottom: 12px;
}

.author-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.author-image {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
}

.author-name {
    font-weight: 500;
    color: #333;
}

.post-date {
    color: #6b7280;
    font-size: 14px;
}

.post-title {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 8px;
}

.post-preview {
    color: #6b7280;
    font-size: 14px;
    line-height: 1.5;
}

.post-footer {
    margin-top: 12px;
}

.post-stats {
    display: flex;
    gap: 16px;
    color: #6b7280;
    font-size: 14px;
}

/* 페이지네이션 */
.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

@media (max-width: 768px) {
    .main-container {
        padding: 10px;
    }

    .board-header {
        flex-direction: column;
        gap: 15px;
    }

    .search-area {
        flex-direction: column;
        max-width: 100%;
    }

    .category-sidebar {
        margin-bottom: 20px;
    }
}

.rank-icon {
    font-size: 16px;  /* 닉네임과 동일한 크기 */
    margin-left:-5px;
    margin-bottom: 15px;
}

/* 새로 추가되는 스타일 */
.sidebar-col {
  position: relative;
}

.sticky-sidebar {
  position: -webkit-sticky;
  position: sticky;
  top: 64px;
  height: auto;
}

.ad-banner {
  height: 100%;
  width: 100%;
}

.banner-img2 {
  height: 100%;
  width: 100%;
}

/* 스크롤바 스타일링 */
.sticky-sidebar::-webkit-scrollbar {
  width: 4px;
}

.sticky-sidebar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.sticky-sidebar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}

.sticky-sidebar::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* v-col 스타일 추가 */
.v-col:first-child {
    position: relative;
    min-width: 200px;
    width: auto;
}
</style>
