<!--<template>-->
<!--  <v-container>-->
<!--    <v-row>-->
<!--      <v-col>-->
<!--        <v-card>-->
<!--          <v-card-title class="text-center text-h5">-->
<!--            블로그 링크 조회-->
<!--          </v-card-title>-->
<!--          <v-row align="center" justify="center" class="px-4 py-4">-->
<!--            &lt;!&ndash; 검색 옵션 선택 &ndash;&gt;-->
<!--            <v-col cols="8" sm="2" class="text-center">-->
<!--              <v-select-->
<!--                  v-model="searchType"-->
<!--                  :items="searchOptions"-->
<!--                  item-title="text"-->
<!--                  item-value="value"-->
<!--                  outlined-->
<!--                  dense-->
<!--                  hide-details-->
<!--                  class="search-select"-->
<!--                  bg-color="grey-lighten-4"-->
<!--                  variant="outlined"-->
<!--              ></v-select>-->
<!--            </v-col>-->
<!--            &lt;!&ndash; 검색 입력창 &ndash;&gt;-->
<!--            <v-col cols="12" sm="6" class="text-center">-->
<!--              <v-text-field-->
<!--                  v-model="searchKeyword"-->
<!--                  label="검색어 입력"-->
<!--                  outlined-->
<!--                  dense-->
<!--                  hide-details-->
<!--                  clearable-->
<!--                  class="search-input"-->
<!--                  bg-color="grey-lighten-4"-->
<!--                  variant="outlined"-->
<!--                  prepend-inner-icon="mdi-magnify"-->
<!--                  @update:model-value="search"-->
<!--              ></v-text-field>-->
<!--            </v-col>-->

<!--            &lt;!&ndash; 검색 버튼 &ndash;&gt;-->
<!--            <v-col cols="2">-->
<!--              <v-btn color="purple" class="text-white font-weight-bold" @click="search">-->
<!--                검색-->
<!--              </v-btn>-->
<!--            </v-col>-->
<!--          </v-row>-->
<!--          <v-card-text>-->
<!--            <p v-if="isForbidden" class="text-center text-red text-h5">-->
<!--              관리자만 확인할 수 있는 페이지입니다.-->
<!--            </p>-->
<!--            <v-table v-else>-->
<!--              <thead>-->
<!--              <tr>-->
<!--                <th>기수</th>-->
<!--                <th>이름</th>-->
<!--                <th>전화번호</th>-->
<!--                <th>블로그주소</th>-->
<!--              </tr>-->
<!--              </thead>-->
<!--              <tbody>-->
<!--              <tr v-for="blogLink in blogLinkList" :key="blogLink.loginId">-->
<!--                <td>{{ blogLink.batch }}</td>-->
<!--                <td>{{ blogLink.name }}</td>-->
<!--                <td>{{ blogLink.phoneNumber }}</td>-->
<!--                <td>-->
<!--                  <v-icon-->
<!--                      v-if="formatUrl(blogLink.blogUrl)"-->
<!--                      class="link-icon"-->
<!--                      @click="openLinkInNewTab(formatUrl(blogLink.blogUrl))"-->
<!--                      prepend-icon="mdi-link-box-variant-outline">-->
<!--                    mdi-link-box-variant-outline-->
<!--                  </v-icon>-->
<!--                </td>-->
<!--              </tr>-->
<!--              </tbody>-->
<!--            </v-table>-->
<!--          </v-card-text>-->
<!--        </v-card>-->
<!--      </v-col>-->
<!--    </v-row>-->
<!--  </v-container>-->
<!--</template>-->

<!--<script>-->
<!--import axios from 'axios';-->

<!--export default {-->
<!--  data() {-->
<!--    return {-->
<!--      blogLinkList: [],-->
<!--      pageSize: 10,-->
<!--      currentPage: 0,-->
<!--      isLoading: false,-->
<!--      isLastPage: false,-->
<!--      isForbidden: false,-->
<!--      searchType: 'optional',-->
<!--      searchOptions: [{ text: "선택", value: "optional" }, { text: "기수", value: "batch" }, { text: "이름", value: "name" }],-->
<!--      searchKeyword: '', // null 방지-->
<!--    };-->
<!--  },-->
<!--  async created() {-->
<!--    await this.loadData();-->
<!--    window.addEventListener('scroll', this.scrollPagination);-->
<!--  },-->
<!--  methods: {-->
<!--    async loadData() {-->
<!--      try {-->
<!--        this.isLoading = true;-->

<!--        let params = {-->
<!--          size: this.pageSize,-->
<!--          page: this.currentPage-->
<!--        };-->

<!--        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/blog/list`, { params });-->
<!--        const additionalData = response.data.result.content;-->

<!--        if (additionalData.length === 0) {-->
<!--          this.isLastPage = true;-->
<!--          return;-->
<!--        }-->

<!--        this.blogLinkList = [...this.blogLinkList, ...additionalData];-->
<!--        this.currentPage++;-->
<!--        this.isLoading = false;-->
<!--      } catch (e) {-->
<!--        if (e.response && e.response.status === 403) {-->
<!--          console.log("관리자 권한 없음.");-->
<!--          this.isForbidden = true;-->
<!--        } else {-->
<!--          console.log(e);-->
<!--        }-->
<!--      }-->
<!--    },-->
<!--    formatUrl(url) {-->
<!--      if (!url || url.trim() === "") return null;-->
<!--      return url.startsWith('http://') || url.startsWith('https://') ? url : "https://" + url;-->
<!--    },-->
<!--    scrollPagination() {-->
<!--      const isBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;-->
<!--      if (isBottom && !this.isLoading && !this.isLastPage) {-->
<!--        this.loadData();-->
<!--      }-->
<!--    },-->
<!--    openLinkInNewTab(url){-->
<!--      if (url) window.open(url, '_blank');-->
<!--    },-->
<!--    async search() {-->
<!--      this.blogLinkList = [];-->
<!--      this.currentPage = 0; // 검색 시 페이지 초기화-->
<!--      this.isLastPage = false; // 검색 시 마지막 페이지 여부 초기화-->

<!--      // 검색어가 `null`일 경우 대비하여 안전하게 처리-->
<!--      const trimmedKeyword = this.searchKeyword?.trim() || '';-->

<!--      // 검색어가 없으면 전체 목록 조회-->
<!--      if (!trimmedKeyword) {-->
<!--        return this.loadData();-->
<!--      }-->

<!--      try {-->
<!--        let params = {-->
<!--          size: this.pageSize,-->
<!--          page: this.currentPage-->
<!--        };-->

<!--        let apiEndpoint = `${process.env.VUE_APP_API_BASE_URL}/blog/find`;-->

<!--        if (this.searchType === "batch") {-->
<!--          params.batch = trimmedKeyword;-->
<!--        } else if (this.searchType === "name") {-->
<!--          params.name = trimmedKeyword;-->
<!--        }-->

<!--        console.log("API 호출:", apiEndpoint, params);-->
<!--        const response = await axios.get(apiEndpoint, {params});-->

<!--        this.blogLinkList = response.data.result.content;-->
<!--        this.currentPage = 1; // 검색 결과 페이지 시작-->
<!--        this.isLastPage = response.data.result.last; // 마지막 페이지 여부 반영-->
<!--      } catch (e) {-->
<!--        console.log("검색 실패", e);-->
<!--      }-->
<!--    },-->
<!--  }-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->
<!--.search-select {-->
<!--  border-radius: 8px;-->
<!--}-->

<!--.search-input {-->
<!--  border-radius: 8px;-->
<!--}-->

<!--.search-button {-->
<!--  height: 40px;-->
<!--  border-radius: 8px;-->
<!--  text-transform: none;-->
<!--  margin-left: -24px;-->
<!--  min-width: 80px;-->
<!--}-->
<!--</style>-->
