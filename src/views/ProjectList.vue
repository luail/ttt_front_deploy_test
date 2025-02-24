<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title class="text-center text-h5">
            전체 프로젝트 조회
          </v-card-title>
          <v-row align="center">
            <v-col cols="2">
              <v-select
                  v-model="searchType"
                  :items="searchOptions"
                  item-title="text"
                  item-value="value"
                  outlined
                  dense
              ></v-select>
            </v-col>
            <v-col cols="8">
              <v-text-field
                  v-model="searchKeyword"
                  label="검색어 입력"
                  outlined
                  dense
                  clearable
                  @keyup.enter="searchProjects"
              ></v-text-field>
            </v-col>
            <v-col cols="2" class="d-flex justify-space-between">
              <v-btn color="primary" class="text-white font-weight-bold" @click="searchProjects">
                검색
              </v-btn>
              <v-btn @click="goToProjectCreate">
                생성
              </v-btn>
            </v-col>
          </v-row>
          <v-card-text>
            <v-table>
              <thead>
              <tr>
                <!-- 체크박스 열: 관리자일 경우에만 -->
                <th v-if="isAdmin">
                  <v-checkbox
                      v-model="selectAll"
                      @change="toggleAll"
                      dense
                      hide-details
                  ></v-checkbox>
                </th>
                <th class="sortable-header" @click="sortByBatch">기수</th>
                <th>팀명</th>
                <th>프로젝트 유형</th>
                <th>서비스명</th>
                <th>링크</th>
                <th>기능</th>
                <!-- 글로벌 편집/삭제 버튼 열 (관리자용) -->
                <th v-if="isAdmin">
                  <v-btn
                      color="blue"
                      small
                      @click="openEditDialog"
                      :disabled="selectedProjects.length !== 1"
                  >
                    수정
                  </v-btn>
                  <v-btn
                      color="error"
                      small
                      @click="deleteSelectedProjects"
                      :disabled="selectedProjects.length === 0"
                  >
                    삭제
                  </v-btn>
                </th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="project in filteredProjects" :key="project.id">
                <!-- 체크박스 열 -->
                <td v-if="isAdmin">
                  <v-checkbox
                      v-model="selectedProjects"
                      :value="project.id"
                      dense
                      hide-details
                  ></v-checkbox>
                </td>
                <td>{{ project.batch }}</td>
                <td>{{ project.teamName }}</td>
                <td>{{ project.projectType }}</td>
                <td>{{ project.serviceName }}</td>
                <td>
                  <v-icon
                      v-if="formatUrl(project.link)"
                      class="link-icon"
                      @click="openLinkInNewTab(formatUrl(project.link))"
                      prepend-icon="mdi-link-box-variant-outline"
                  >
                    mdi-link-box-variant-outline
                  </v-icon>
                </td>
                <td>
                  <v-chip-group column>
                    <v-chip
                        v-for="(feature, index) in project.primaryFeatureList"
                        :key="index"
                        :class="{ 'selected-chip': feature.featureName === selectedFeature }"
                        @click="toggleFeature(feature.featureName)"
                    >
                      {{ feature.featureName || '기능 없음' }}
                    </v-chip>
                  </v-chip-group>
                </td>
                <!-- 빈 셀로 헤더 정렬 유지 -->
                <td v-if="isAdmin"></td>
              </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 수정 팝업 다이얼로그 -->
    <project-edit-dialog
        v-if="editDialogVisible"
        :project="getSelectedProject()"
        @close="editDialogVisible = false"
        @updated="handleProjectUpdated"
    />
  </v-container>
</template>

<script>
import axios from 'axios';
import ProjectEditDialog from "@/components/ProjectEditDialog.vue";

export default {
  components: { ProjectEditDialog },
  data() {
    return {
      projectList: [],
      selectedProjects: [],
      selectedFeature: null,
      sortDirection: "asc",
      pageSize: 10,
      currentPage: 0,
      isLoading: false,
      isLastPage: false,
      isAdmin: localStorage.getItem("role") === "ADMIN",
      searchType: 'optional',
      searchOptions: [
        { text: "선택", value: "optional" },
        { text: "기수", value: "batch" },
        { text: "프로젝트 유형", value: "projectType" },
        { text: "서비스명", value: "serviceName" }
      ],
      searchKeyword: '',
      selectAll: false,
      editDialogVisible: false
    };
  },
  async created() {
    await this.fetchProjects();
    this.checkAdminStatus();
    window.addEventListener('scroll', this.scrollPagination);
  },
  computed: {
    filteredProjects() {
      return this.selectedFeature
          ? this.projectList.filter(project =>
              project.primaryFeatureList.some(feature => feature.featureName === this.selectedFeature)
          )
          : this.projectList;
    }
  },
  methods: {
    // 검색어와 검색 옵션에 따른 파라미터 반환
    getSearchParams() {
      const trimmedKeyword = this.searchKeyword?.trim() || '';
      let params = {};
      if (trimmedKeyword) {
        if (this.searchType === "batch") {
          params.batch = trimmedKeyword;
        } else if (this.searchType === "projectType") {
          params.projectType = trimmedKeyword;
        } else if (this.searchType === "serviceName") {
          params.serviceName = trimmedKeyword;
        }
      }
      return params;
    },
    async fetchProjects() {
      if (this.isLoading || this.isLastPage) return;
      this.isLoading = true;
      try {
        let params = {
          size: this.pageSize,
          page: this.currentPage,
          ...this.getSearchParams()
        };
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/project/find`, {params});
        const newProjects = response.data.result.content.map(project => ({
          ...project,
          primaryFeatureList: project.primaryFeatureList || []
        }));
        if (this.currentPage === 0) {
          this.projectList = newProjects;
        } else {
          this.projectList = [...this.projectList, ...newProjects];
        }
        this.currentPage++;
        this.isLastPage = response.data.result.last;
      } catch (e) {
        console.log("데이터 불러오기 실패", e);
      } finally {
        this.isLoading = false;
      }
    },
    toggleAll() {
      this.selectedProjects = this.selectAll ? this.filteredProjects.map(project => project.id) : [];
    },
    async deleteSelectedProjects() {
      if (!confirm(`${this.selectedProjects.length}개의 프로젝트를 삭제하시겠습니까?`)) return;
      try {
        await Promise.all(
            this.selectedProjects.map(id => {
              if (!id) return Promise.resolve();
              return axios.delete(`${process.env.VUE_APP_API_BASE_URL}/project/delete/${id}`);
            })
        );
        alert("✅ 선택된 프로젝트가 삭제되었습니다.");
        this.projectList = this.projectList.filter(project => !this.selectedProjects.includes(project.id));
        this.selectedProjects = [];
        this.selectAll = false;
      } catch (e) {
        console.error("❌ 선택 삭제 실패:", e);
        alert("삭제에 실패했습니다.");
      }
    },
    openEditDialog() {
      if (this.selectedProjects.length !== 1) {
        alert("수정을 위해서는 하나의 프로젝트만 선택해야 합니다.");
        return;
      }
      this.editDialogVisible = true;
    },
    getSelectedProject() {
      const selectedId = this.selectedProjects[0];
      return this.projectList.find(project => project.id === selectedId) || {};
    },
    handleProjectUpdated() {
      this.editDialogVisible = false;
      this.selectedProjects = [];
      this.selectAll = false;
      // 전체 목록 초기화 후 새로 불러오기
      this.projectList = [];
      this.currentPage = 0;
      this.isLastPage = false;
      this.fetchProjects();
    },
    async searchProjects() {
      // 검색 시 상태 초기화
      this.projectList = [];
      this.selectedProjects = [];
      this.selectAll = false;
      this.currentPage = 0;
      this.isLastPage = false;
      const trimmedKeyword = this.searchKeyword?.trim() || '';
      if (!trimmedKeyword) {
        return this.fetchProjects();
      }
      try {
        let params = {
          size: this.pageSize,
          page: this.currentPage,
          ...this.getSearchParams()
        };
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/project/find`, {params});
        this.projectList = response.data.result.content.map(project => ({
          ...project,
          primaryFeatureList: project.primaryFeatureList || []
        }));
        this.currentPage = 1;
        this.isLastPage = response.data.result.last;
      } catch (e) {
        console.log("검색 실패", e);
      }
    },
    formatUrl(url) {
      if (!url || url.trim() === "") return null;
      return url.startsWith('http://') || url.startsWith('https://') ? url : "https://" + url;
    },
    toggleFeature(featureName) {
      this.selectedFeature = this.selectedFeature === featureName ? null : featureName;
    },
    scrollPagination() {
      const isBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (isBottom && !this.isLoading && !this.isLastPage) {
        this.fetchProjects();
      }
    },
    checkAdminStatus() {
      const role = localStorage.getItem('role');
      this.isAdmin = role === "ADMIN";
    },
    goToProjectCreate() {
      this.$router.replace(`/ttt/project/create`);
    },
    openLinkInNewTab(url) {
      if (url) window.open(url, '_blank');
    },
    sortByBatch() {
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
        this.projectList.sort((a, b) => b.batch - a.batch);
      } else {
        this.sortDirection = 'asc';
        this.projectList.sort((a, b) => a.batch - b.batch);
      }
    }
  }
};
</script>

<style>
.selected-chip {
  background-color: #b7f892 !important;
  color: black !important;
  font-weight: bold;
}

.sortable-header {
  cursor: pointer;
}
</style>
