<template>
  <v-container class="pa-6">
    <v-row>
      <v-col>
        <v-card>
          <v-card-title class="text-center text-h5">
            Beyond SW Camp 프로젝트
          </v-card-title>
          <v-row align="center">
            <v-spacer></v-spacer>
            <v-col cols="9">
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
                  @keyup.enter="searchProjects"
                >
              </div>
            </v-col>
            <v-col cols="2" class="d-flex justify-end pe-12">
              <v-btn @click="goToProjectCreate" color="purple" class="neon-btn">생성</v-btn>
            </v-col>
            <v-spacer></v-spacer>
          </v-row>

          
          <v-card-text>
            <v-data-table
                :headers="headers"
                :items="filteredProjects"
                :items-per-page="10"
                class="elevation-1 custom-table"
            >
              <template v-slot:item="{ item }">
                <tr 
                  class="project-row" 
                  @click="goToProjectDetail(item.id)"
                  style="cursor: pointer"
                >
                  <td class="text-center">{{ item.batch }}</td>
                  <td>
                    <div class="font-weight-medium">{{ item.teamName }}</div>
                  </td>
                  <td>
                    <v-chip small color="light-green" text-color="white">
                      {{ item.projectType }}
                    </v-chip>
                  </td>
                  <td>{{ item.serviceName }}</td>
                  <td>
                    <v-chip-group>
                      <v-chip
                          v-for="(feature, index) in item.primaryFeatureList"
                          :key="index"
                          :class="{ 'selected-chip': feature.featureName === selectedFeature }"
                          @click.stop="toggleFeature(feature.featureName)"
                          small
                          outlined
                      >
                        {{ feature.featureName || '기능 없음' }}
                      </v-chip>
                    </v-chip-group>
                  </td>
                  <td class="text-center">
                    <v-icon small color="pink lighten-1" class="mr-1">mdi-eye</v-icon>
                    {{ item.viewCount || 0 }}
                  </td>
                  <td class="text-center">
                    <v-icon small color="pink lighten-1" class="mr-1">mdi-heart</v-icon>
                    {{ item.likesCounts || 0 }}
                  </td>
                  <td class="text-center">
                    <v-icon small color="blue lighten-1" class="mr-1">mdi-comment</v-icon>
                    {{ item.commentCounts || 0 }}
                  </td>
                  <td class="text-center">
                    <v-icon
                      v-if="item.link"
                      small
                      color="grey"
                      class="link-icon"
                      @click.stop="openLink(item.link)"
                    >
                      mdi-link-variant
                    </v-icon>
                  </td>
                </tr>
              </template>
            </v-data-table>
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
      projectList: [], //현재 페이지에 표시될 프로젝트 리스트
      selectedProjects: [],
      selectedFeature: null,
      sortDirection: "asc",
      page:1,
      pageSize: 25, //한 페이지당 표시될 프로젝트 개수
      currentPage: 1, //현재 보고 있는 페이지 번호
      isLoading: false,
      isLastPage: false,
      searchType: 'optional',
      searchOptions: [
        { text: "선택", value: "optional" },
        { text: "기수", value: "batch" },
        { text: "프로젝트 유형", value: "projectType" },
        { text: "서비스명", value: "serviceName" }
      ],
      searchKeyword: '',
      selectAll: false,
      headers: [
        { title: '기수', key: 'batch', align: 'center', width: '8%', sortable: true },
        { title: '팀명', key: 'teamName', width: '10%', sortable: true },
        { title: '프로젝트 유형', key: 'projectType', width: '14%', sortable: true },
        { title: '서비스명', key: 'serviceName', width: '12%', sortable: true },
        { title: '기능 키워드', key: 'primaryFeatureList', width: '20%', sortable: false },
        { 
          title: '조회수', 
          key: 'viewCount', 
          align: 'center', 
          width: '10%', 
          sortable: true 
        },
        { 
          title: '좋아요', 
          key: 'likesCounts', 
          align: 'center', 
          width: '10%', 
          sortable: true 
        },
        { 
          title: '댓글', 
          key: 'commentCounts', 
          align: 'center', 
          width: '8%', 
          sortable: true 
        },
        { title: '링크', key: 'link', align: 'center', width: '8%', sortable: false },
      ],
      totalItems: 0, //백엔드에서 가져온 전체 프로젝트 개수
      totalPages: 0  //전체 페이지 개수
    };
  },
  async created() {
    const savedPage = localStorage.getItem('currentPage');
    this.currentPage = savedPage ? parseInt(savedPage) : 1;
    await this.fetchProjects();
  },
  computed: {
    filteredProjects() {
      let filtered = this.projectList;
      
      // 검색어가 있고 검색 타입이 선택되었을 때
      if (this.searchKeyword && this.searchType !== 'optional') {
        filtered = this.projectList.filter(project => {
          if (this.searchType === 'batch') {
            return project.batch.toString().includes(this.searchKeyword);
          } else if (this.searchType === 'projectType') {
            return project.projectType.toLowerCase().includes(this.searchKeyword.toLowerCase());
          } else if (this.searchType === 'serviceName') {
            return project.serviceName.toLowerCase().includes(this.searchKeyword.toLowerCase());
          }
          return true;
        });
      }
      
      // 기능 키워드 필터링
      if (this.selectedFeature) {
        filtered = filtered.filter(project =>
          project.primaryFeatureList.some(feature => 
            feature.featureName === this.selectedFeature
          )
        );
      }
      
      return filtered;
    }
  },
  beforeRouteEnter(to, from, next) {
  next(vm => {
    const savedPage = localStorage.getItem('currentPage');
    if (savedPage) {
      vm.currentPage = parseInt(savedPage);
    } else {
      vm.currentPage = 1;
    }
  });
},

beforeRouteLeave(to, from, next) {
  localStorage.setItem('currentPage', this.currentPage);
  next();
},
  methods: {
    async fetchProjects() {
      try {
        // 기본 프로젝트 목록을 가져오는 API 호출
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/project/listAll`);
        this.projectList = response.data.result;
      } catch (e) {
        console.error("데이터 불러오기 실패", e);
      }
    },
    toggleAll() {
      this.selectedProjects = this.selectAll ? this.filteredProjects.map(project => project.id) : [];
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
      this.currentPage = 1;
      this.isLastPage = false;
      this.fetchProjects();
    },
    async searchProjects() {
      try {
        let url = `${process.env.VUE_APP_API_BASE_URL}/project/listAll`;
        
        // 검색 타입이 'optional'이 아니고 검색어가 있는 경우에만 검색 수행
        if (this.searchType !== 'optional' && this.searchKeyword.trim()) {
          const params = new URLSearchParams();
          
          switch(this.searchType) {
            case 'batch':
              params.append('batch', this.searchKeyword.trim());
              break;
            case 'projectType':
              params.append('projectType', this.searchKeyword.trim());
              break;
            case 'serviceName':
              params.append('serviceName', this.searchKeyword.trim());
              break;
          }
          
          url += '?' + params.toString();
        }
        
        const response = await axios.get(url);
        this.projectList = response.data.result;
      } catch (error) {
        console.error("검색 실패:", error);
      }
    },
    formatUrl(url) {
      if (!url || url.trim() === "") return null;
      return url.startsWith('http://') || url.startsWith('https://') ? url : "https://" + url;
    },
    async toggleFeature(featureName) {
      this.selectedFeature = this.selectedFeature === featureName ? null : featureName;
      const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/project/listAll`);
      this.projectList = response.data.result;
    },

    
    goToProjectCreate() {
      this.$router.replace(`/ttt/project/create`);
    },
    sortByBatch() {
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
        this.projectList.sort((a, b) => b.batch - a.batch);
      } else {
        this.sortDirection = 'asc';
        this.projectList.sort((a, b) => a.batch - b.batch);
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
      localStorage.setItem('currentPage', this.currentPage);
      this.fetchProjects();
    },
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
    openLink(url) {
      const formattedUrl = this.formatUrl(url);
      if (formattedUrl) {
        window.open(formattedUrl, '_blank');
      }
    },
    goToProjectDetail(projectId) {
      window.open(`/ttt/project/detail/${projectId}`, '_blank');
    }
  }
};
</script>

<style>
.custom-table {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.project-row {
  height: 60px;
  transition: background-color 0.2s;
}

.project-row:hover {
  background-color: #f5f5f5;
}

.v-data-table >>> thead th {
  font-weight: bold !important;
  background-color: #f8f9fa !important;
  color: #333 !important;
  padding: 12px !important;
  text-transform: none !important;
}

.selected-chip {
  background-color: #b7f892 !important;
  color: black !important;
  font-weight: bold;
}

.v-chip {
  margin: 2px;
}

.v-chip-group {
  flex-wrap: wrap;
}

.v-btn.v-btn--icon.small {
  width: 24px;
  height: 24px;
}

.link-icon {
  font-size: 16px !important;
  cursor: pointer;
}

.link-icon:hover {
  color: #1976d2 !important;
}

.neon-btn {
  font-size: 1rem !important;
  font-weight: 500;
  transition: all 0.3s ease;
}

.neon-btn:hover {
  transform: scale(1.05);
}

/* 검색 영역 스타일 추가 */
.search-area {
  display: flex;
  gap: 10px;
  flex: 1;
  width: 100%;
}

.search-select {
  width: 100px;
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

/* 반응형 스타일 */
@media (max-width: 768px) {
  .search-area {
    flex-direction: column;
    max-width: 100%;
  }
}
</style>
