<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title class="text-center text-h5">
            회원 목록 조회
          </v-card-title>
          <!-- 검색 영역 -->
          <div class="search-area">
            <input
                v-model="searchKeyword"
                type="text"
                placeholder="닉네임으로 검색하세요"
                class="search-input"
                @keyup.enter="searchUsers"
            />
            <v-btn @click="searchUsers" color="purple" class="neon-btn">검색</v-btn>
            <!-- 항상 보이되, 선택된 사용자 없으면 disabled -->
            <v-btn
                color="red"
                class="neon-btn ml-2"
                :disabled="selectedUsers.length === 0"
                @click="deleteSelectedUsers"
            >
              삭제
            </v-btn>
          </div>

          <v-card-text>
            <p v-if="isForbidden" class="text-center text-red text-h5">
              관리자만 확인할 수 있는 페이지입니다.
            </p>
            <v-table v-else>
              <thead>
              <tr>
                <th>
                  <v-checkbox
                      v-model="selectAll"
                      @change="toggleSelectAll"
                      hide-details
                  />
                </th>
                <th>닉네임</th>
                <th>이름</th>
                <th>로그인ID</th>
                <th>email</th>
                <th>휴대폰번호</th>
                <th>기수</th>
                <th>블로그</th>
                <th>랭킹포인트</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="user in userList" :key="user.loginId">
                <td>
                  <v-checkbox
                      v-model="selectedUsers"
                      :value="user.loginId"
                      hide-details
                  />
                </td>
                <td>{{ user.nickName }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.loginId }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.phoneNumber }}</td>
                <td>{{ user.batch }}</td>
                <td>
                  <v-icon
                      v-if="formatUrl(user.blogLink)"
                      class="link-icon"
                      @click="openLinkInNewTab(formatUrl(user.blogLink))"
                      prepend-icon="mdi-link-box-variant-outline"
                  >
                    mdi-link-box-variant-outline
                  </v-icon>
                  <span v-else>Url 없음</span>
                </td>
                <td>{{ user.rankingPoint }}</td>
              </tr>
              </tbody>
            </v-table>
          </v-card-text>
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
      userList: [],
      pageSize: 10,
      currentPage: 0,
      isLoading: false,
      isLastPage: false,
      isForbidden: false,
      searchKeyword: '',
      selectedUsers: [], // 선택된 사용자 ID 배열
      selectAll: false // 전체 선택 상태
    }
  },
  async created() {
    this.loadData();
    window.addEventListener('scroll', this.scrollPagenation);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.scrollPagenation);
  },
  methods: {
    async loadData() {
      try {
        this.isLoading = true;
        let params = {
          size: this.pageSize,
          page: this.currentPage
        };
        let url = `${process.env.VUE_APP_API_BASE_URL}/user/list/active`;
        if (this.searchKeyword) {
          url = `${process.env.VUE_APP_API_BASE_URL}/user/list/search`;
          params.nickName = this.searchKeyword;
        }
        const response = await axios.get(url, { params });
        const additionalData = response.data.result.content;
        if (additionalData.length === 0) {
          this.isLastPage = true;
          return;
        }
        this.userList = this.currentPage === 0
            ? additionalData
            : [...this.userList, ...additionalData];
        this.currentPage++;
      } catch (e) {
        if (e.response && e.response.status === 403) {
          console.log("관리자 권한 없음.");
          this.isForbidden = true;
        } else {
          console.log(e);
        }
      } finally {
        this.isLoading = false;
      }
    },
    async searchUsers() {
      this.currentPage = 0;
      this.userList = [];
      this.isLastPage = false;
      this.selectedUsers = [];
      this.selectAll = false;
      await this.loadData();
    },
    scrollPagenation() {
      const isBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (isBottom && !this.isLoading && !this.isLastPage) {
        this.loadData();
      }
    },
    toggleSelectAll() {
      if (this.selectAll) {
        this.selectedUsers = this.userList.map(user => user.loginId);
      } else {
        this.selectedUsers = [];
      }
    },
    async deleteSelectedUsers() {
      if (confirm(`${this.selectedUsers.length}명의 사용자를 삭제하시겠습니까?`)) {
        try {
          await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user/delete`, {
            loginIds: this.selectedUsers
          });
          this.selectedUsers = [];
          this.selectAll = false;
          this.currentPage = 0;
          this.userList = [];
          this.isLastPage = false;
          await this.loadData();
          alert('선택된 사용자가 삭제되었습니다.');
        } catch (e) {
          console.error(e);
          alert('삭제 중 오류가 발생했습니다.');
        }
      }
    },
    formatUrl(url) {
      if (!url || url.trim() === "") return null;
      return url.startsWith('http://') || url.startsWith('https://')
          ? url
          : "https://" + url;
    },
    openLinkInNewTab(url) {
      if (url) window.open(url, '_blank');
    }
  }
}
</script>

<style scoped>
.search-area {
  display: flex;
  align-items: center;
  /* 가운데 정렬을 위해 margin: 0 auto와 적절한 너비 지정 */
  margin: 0 auto;
  gap: 10px;
  max-width: 600px;
  justify-content: center;
}

.search-input {
  width: 300px; /* 검색창 너비 고정 */
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.neon-btn {
  margin-left: 10px;
}

.ml-2 {
  margin-left: 8px;
}

.link-icon {
  cursor: pointer;
  color: #6200ea;
}
</style>
