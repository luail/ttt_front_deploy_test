<template>
  <v-container class="pa-6">
    <v-card>
      <v-card-title class="text-center text-h5">
        Beyond SW Camp 프로젝트
      </v-card-title>
      
      <!-- 검색 영역 -->
      <v-row align="center" justify="center" class="pl-12">
        <v-col cols="6">
          <div class="search-area">
            <v-select
              v-model="searchType"
              :items="searchOptions"
              item-title="text"
              item-value="value"
              hide-details
              class="search-select"
              style="max-width: 150px"
            ></v-select>
            <v-text-field
              v-model="searchKeyword"
              placeholder="검색어를 입력하세요"
              hide-details
              @keyup.enter="searchProjects"
              class="search-input ml-2"
            ></v-text-field>
          </div>
        </v-col>
        <v-col cols="2" class="d-flex align-center">
          <v-btn @click="goToProjectCreate" color="purple" class="neon-btn">생성</v-btn>
        </v-col>
      </v-row>

      <!-- 커스텀 테이블 헤더 -->
      <v-card-text>
        <div class="custom-table">
          <div class="table-header">
            <div class="header-cell text-center" 
                 :class="{ 'active-sort': sortBy === 'batch' }" 
                 style="width: 70px" 
                 @click="sort('batch')">
              기수
              <v-icon small class="sort-icon" v-if="sortBy === 'batch'">
                {{ sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
              </v-icon>
            </div>
            <div class="header-cell text-truncate" 
                 :class="{ 'active-sort': sortBy === 'teamName' }"
                 style="width: 120px" 
                 @click="sort('teamName')">
              팀명
              <v-icon small class="sort-icon" v-if="sortBy === 'teamName'">
                {{ sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
              </v-icon>
            </div>
            <div class="header-cell" 
                 :class="{ 'active-sort': sortBy === 'projectType' }"
                 style="width: 140px" 
                 @click="sort('projectType')">
              프로젝트 유형
              <v-icon small class="sort-icon" v-if="sortBy === 'projectType'">
                {{ sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
              </v-icon>
            </div>
            <div class="header-cell text-truncate" 
                 :class="{ 'active-sort': sortBy === 'serviceName' }"
                 style="width: 140px" 
                 @click="sort('serviceName')">
              서비스명
              <v-icon small class="sort-icon" v-if="sortBy === 'serviceName'">
                {{ sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
              </v-icon>
            </div>
            <div class="header-cell" style="width: 220px">기능 키워드</div>
            <div class="header-cell text-center" 
                 :class="{ 'active-sort': sortBy === 'viewCount' }"
                 style="width: 90px" 
                 @click="sort('viewCount')">
              조회수
              <v-icon small class="sort-icon" v-if="sortBy === 'viewCount'">
                {{ sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
              </v-icon>
            </div>
            <div class="header-cell text-center" 
                 :class="{ 'active-sort': sortBy === 'likesCounts' }"
                 style="width: 90px" 
                 @click="sort('likesCounts')">
              좋아요
              <v-icon small class="sort-icon" v-if="sortBy === 'likesCounts'">
                {{ sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
              </v-icon>
            </div>
            <div class="header-cell text-center" 
                 :class="{ 'active-sort': sortBy === 'commentCounts' }"
                 style="width: 70px" 
                 @click="sort('commentCounts')">
              댓글
              <v-icon small class="sort-icon" v-if="sortBy === 'commentCounts'">
                {{ sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
              </v-icon>
            </div>
            <div class="header-cell text-center" style="width: 60px">링크</div>
          </div>

          <!-- 가상 스크롤 테이블 본문 -->
          <v-virtual-scroll
            ref="virtualScroll"
            :items="sortedAndFilteredProjects"
            :height="400"
            item-height="48"
            class="virtual-scroll-container"
          >
            <template v-slot:default="{ item }">
              <div class="table-row" @click="goToProjectDetail(item.id)">
                <div class="cell text-center" style="width: 70px">{{ item.batch }}</div>
                <div class="cell text-truncate" style="width: 120px">{{ item.teamName }}</div>
                <div class="cell" style="width: 140px">
                  <v-chip small :color="getProjectTypeColor(item.projectType)" text-color="white">
                    {{ item.projectType }}
                  </v-chip>
                </div>
                <div class="cell text-truncate" style="width: 140px">{{ item.serviceName }}</div>
                <div class="cell" style="width: 220px">
                  <div class="feature-container">
                    <v-chip
                      v-for="(feature, index) in item.primaryFeatureList"
                      :key="index"
                      small
                      outlined
                      :class="{ 'selected-chip': feature.featureName === selectedFeature }"
                      @click.stop="toggleFeature(feature.featureName)"
                    >
                      {{ feature.featureName || '기능 없음' }}
                    </v-chip>
                  </div>
                </div>
                <div class="cell text-center" style="width: 90px">
                  <v-icon small color="pink lighten-1" class="mr-1">mdi-eye</v-icon>
                  {{ item.viewCount || 0 }}
                </div>
                <div class="cell text-center" style="width: 90px">
                  <v-icon small color="pink lighten-1" class="mr-1">mdi-heart</v-icon>
                  {{ item.likesCounts || 0 }}
                </div>
                <div class="cell text-center" style="width: 70px">
                  <v-icon small color="blue lighten-1" class="mr-1">mdi-comment</v-icon>
                  {{ item.commentCounts || 0 }}
                </div>
                <div class="cell text-center" style="width: 60px">
                  <v-icon
                    v-if="item.link"
                    small
                    class="link-icon"
                    color="grey"
                    @click.stop="openLink(item.link)"
                  >
                    mdi-link-variant
                  </v-icon>
                </div>
              </div>
            </template>
          </v-virtual-scroll>
        </div>

        <!-- 페이지네이션 -->
        <div class="d-flex justify-center mt-4">
          <v-pagination
            v-model="page"
            :length="Math.ceil(filteredProjects.length / itemsPerPage)"
            :total-visible="7"
          ></v-pagination>
        </div>
      </v-card-text>
    </v-card>

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
      itemsPerPage: 10, //한 페이지당 표시될 프로젝트 개수
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
      sortBy: '',
      sortDesc: false,
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
      totalPages: 0,  //전체 페이지 개수
      tableOptions: {
        page: 1,
        itemsPerPage: 10,
        sortBy: [],
        sortDesc: [],
        groupBy: [],
        groupDesc: [],
        multiSort: false
      },
    };
  },
  watch: {
    tableOptions: {
      handler(newVal) {
        if (newVal.sortBy && newVal.sortBy.length > 0) {
          const sortBy = newVal.sortBy[0];
          const sortDesc = newVal.sortDesc && newVal.sortDesc[0];
          
          this.projectList = [...this.projectList].sort((a, b) => {
            let compareA = a[sortBy];
            let compareB = b[sortBy];
            
            // 숫자형 데이터 처리
            if (['batch', 'viewCount', 'likesCounts', 'commentCounts'].includes(sortBy)) {
              compareA = Number(compareA) || 0;
              compareB = Number(compareB) || 0;
            } else {
              // 문자열 처리
              compareA = compareA || '';
              compareB = compareB || '';
            }
            
            // 정렬 방향에 따른 비교
            if (sortDesc) {
              return compareB > compareA ? 1 : compareB < compareA ? -1 : 0;
            } else {
              return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
            }
          });
        }
      },
      deep: true
    },
    page: {
      handler() {
        this.resetScroll();
      }
    },
    searchKeyword: {
      handler() {
        if (this.searchType !== 'optional') {
          this.resetScroll();
        }
      }
    },
    searchType: {
      handler() {
        this.resetScroll();
      }
    }
  },
  async created() {
    const savedPage = localStorage.getItem('currentPage');
    this.currentPage = savedPage ? parseInt(savedPage) : 1;
    
    // URL 쿼리 파라미터 확인
    const { searchType, searchKeyword } = this.$route.query;
    if (searchType && searchKeyword) {
      this.searchType = searchType;
      this.searchKeyword = searchKeyword;
      await this.searchProjects();  // 검색 실행
    } else {
      await this.fetchProjects();
    }
    this.initializeTableOptions();
  },
  computed: {
    filteredProjects() {
      let result = [...this.projectList];
      
      // 검색어 필터링
      if (this.searchKeyword && this.searchType !== 'optional') {
        result = result.filter(project => {
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
      result = this.filterByFeature(result);
      
      return result;
    },
    sortedAndFilteredProjects() {
      const start = (this.page - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      
      let result = [...this.filteredProjects];
      
      // 항상 기본 정렬 상태 유지 (기수 기준 내림차순)
      result.sort((a, b) => {
        // 사용자가 선택한 정렬이 있는 경우
        if (this.sortBy) {
          let compareA = a[this.sortBy];
          let compareB = b[this.sortBy];
          
          if (['batch', 'viewCount', 'likesCounts', 'commentCounts'].includes(this.sortBy)) {
            compareA = Number(compareA) || 0;
            compareB = Number(compareB) || 0;
          } else {
            compareA = String(compareA || '').toLowerCase();
            compareB = String(compareB || '').toLowerCase();
          }
          
          if (this.sortDesc) {
            return compareB > compareA ? 1 : -1;
          } else {
            return compareA > compareB ? 1 : -1;
          }
        }
        // 기본 정렬: 기수 기준 내림차순
        return (Number(b.batch) || 0) - (Number(a.batch) || 0);
      });
      
      return result.slice(start, end);
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
    initializeTableOptions() {
      this.tableOptions = {
        page: 1,
        itemsPerPage: 10,
        sortBy: [],
        sortDesc: [],
        groupBy: [],
        groupDesc: [],
        multiSort: false
      };
    },
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
        this.page = 1;
        this.resetScroll();
      } catch (error) {
        console.error("검색 실패:", error);
      }
    },
    formatUrl(url) {
      if (!url || url.trim() === "") return null;
      return url.startsWith('http://') || url.startsWith('https://') ? url : "https://" + url;
    },
    toggleFeature(featureName) {
      if (this.selectedFeature === featureName) {
        this.selectedFeature = null;
      } else {
        this.selectedFeature = featureName;
      }
      this.page = 1;
      this.resetScroll();
    },
    filterByFeature(projects) {
      if (!this.selectedFeature) return projects;
      
      return projects.filter(project => 
        project.primaryFeatureList && 
        project.primaryFeatureList.some(feature => 
          feature.featureName === this.selectedFeature
        )
      );
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
    },
    getProjectTypeColor(type) {
      switch(type) {
        case 'FINAL': return 'light-green';
        case 'BACKEND': return 'blue lighten-2';
        case 'FRONTEND': return 'purple lighten-2';
        case 'DB': return 'green lighten-2';
        default: return 'grey';
      }
    },
    sort(column) {
      if (this.sortBy === column) {
        this.sortDesc = !this.sortDesc;
      } else {
        this.sortBy = column;
        this.sortDesc = false;
      }
      this.resetScroll();
    },
    resetScroll() {
      setTimeout(() => {
        const container = document.querySelector('.virtual-scroll-container');
        if (container) {
          container.scrollTop = 0;
        }
      }, 0);
    },
  }
};
</script>

<style scoped>
/* 테이블 컨테이너 스타일 수정 */
.custom-table {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  background: white;
}

/* 테이블 헤더와 행 공통 스타일 */
.table-header,
.table-row {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: stretch;
  padding: 0 16px;
  box-sizing: border-box; /* 패딩이 너비에 포함되도록 설정 */
}

/* 가상 스크롤 컨테이너 스타일 */
.virtual-scroll-container {
  width: 100%;
}

/* 셀 공통 스타일 */
.header-cell,
.cell {
  display: flex;
  align-items: center;
  padding: 12px 8px;
  box-sizing: border-box;
}

/* 각 컬럼별 너비 고정 (기존 스타일 유지하면서 box-sizing 추가) */
.header-cell[style*="width"],
.cell[style*="width"] {
  box-sizing: border-box;
  flex-shrink: 0; /* 너비 고정 */
}

/* 테이블 행 스타일 수정 */
.table-row {
  display: flex;
  width: 100%;
  min-height: 48px;
  height: auto;
  align-items: stretch;
  padding: 0 16px;
  box-sizing: border-box;
  position: relative; /* 가상 요소 위치 기준 */
}

/* 행 구분선 추가 */
.table-row:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 50px; /* 왼쪽 여백 */
  right: 50px; /* 오른쪽 여백 */
  bottom: 0;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.06); /* 희미한 구분선 */
}

/* 행 호버 효과 수정 */
.table-row:hover {
  background-color: rgba(0, 0, 0, 0.02); /* 더 부드러운 호버 효과 */
}

/* 기수 셀 스타일 수정 */
.header-cell[style*="width: 70px"],
.cell[style*="width: 70px"] {
  min-width: 70px !important;
  width: 70px !important;
  justify-content: center;
  text-align: center;
  padding: 12px 4px;
  box-sizing: border-box;
}

/* 기능 키워드 컨테이너 스타일 수정 */
.feature-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 4px;
  width: 100%;
  min-height: 48px;
  height: auto;
  align-content: flex-start; /* 위에서부터 시작 */
}

/* 기능 키워드 칩 스타일 */
.feature-container .v-chip {
  height: 24px !important;
  margin: 2px !important;
  font-size: 12px !important;
  white-space: normal !important; /* 긴 텍스트 줄바꿈 허용 */
}

/* 기능 키워드 셀 스타일 */
.cell[style*="width: 220px"] {
  height: auto !important;
  align-items: flex-start; /* 내용을 위에서부터 시작 */
  padding: 8px;
}

/* 다른 셀들의 세로 정렬 수정 */
.cell {
  display: flex;
  align-items: center; /* 세로 중앙 정렬 */
  height: 100%; /* 부모 높이에 맞춤 */
}

/* 선택된 칩 스타일 */
.selected-chip {
  background-color: #b7f892 !important;
  color: black !important;
}

/* v-virtual-scroll 내부의 테이블 행에 대한 스타일 */
:deep(.v-virtual-scroll__item) {
  width: 100%;
}

.search-area {
  display: flex;
  align-items: center;
  gap: 16px;
}

.v-chip {
  margin: 2px;
  align-self: center;
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

/* 생성 버튼 스타일 수정 */
.neon-btn {
  background-color: #6200ea !important;
  color: white !important;
  font-size: 0.95rem !important;
  font-weight: 500 !important;
  padding: 0 20px !important;
  height: 36px !important;
  border-radius: 8px !important;
  letter-spacing: 0.5px !important;
  text-transform: none !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 3px 5px rgba(98, 0, 234, 0.2) !important;
}

.neon-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(98, 0, 234, 0.3) !important;
  background-color: #7c4dff !important;
}

.neon-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(98, 0, 234, 0.2) !important;
}

/* 테이블 셀 고정 너비 */
::v-deep td {
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

/* 정렬 아이콘 스타일 */
.sort-icon {
  color: rgba(0, 0, 0, 0.87) !important;
  opacity: 0.87 !important;
  transition: transform 0.2s;
  font-size: 16px !important;
  margin-left: 2px !important;
  vertical-align: middle !important;
}

/* 컬럼 너비 조정 */
.header-cell[style*="width: 60px"],
.cell[style*="width: 60px"] {
  min-width: 60px !important;
  width: 60px !important;
}

.header-cell[style*="width: 90px"],
.cell[style*="width: 90px"] {
  min-width: 90px !important;
  width: 90px !important;
}

.header-cell[style*="width: 120px"],
.cell[style*="width: 120px"] {
  min-width: 120px !important;
  width: 120px !important;
}

.header-cell[style*="width: 140px"],
.cell[style*="width: 140px"] {
  min-width: 140px !important;
  width: 140px !important;
}

.header-cell[style*="width: 220px"],
.cell[style*="width: 220px"] {
  min-width: 220px !important;
  width: 220px !important;
}

/* 아이콘과 숫자가 있는 셀 스타일 수정 */
.cell.text-center {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding: 12px 4px;
  box-sizing: border-box;
  flex-shrink: 0;
}

/* 아이콘 정렬 */
.v-icon {
  margin: 0 2px;
}

/* 정렬 가능한 헤더 셀 스타일 */
.header-cell {
  cursor: default;
  user-select: none;
}

.header-cell[style*="width"] {
  position: relative;
  transition: background-color 0.2s;
}

/* 정렬 가능한 헤더에 호버 효과 */
.header-cell[style*="width"]:hover {
  background-color: rgba(98, 0, 234, 0.04);
  cursor: pointer;
}

/* 정렬 가능한 헤더에 작은 화살표 표시 */
.header-cell[style*="width"]::after {
  content: '↕';
  opacity: 0;
  margin-left: 4px;
  font-size: 10px;
  transition: opacity 0.2s;
  display: inline-block;
  vertical-align: middle;
}

.header-cell[style*="width"]:hover:not(.active-sort)::after {
  opacity: 0.3;
}

/* 현재 정렬중인 컬럼 스타일 */
.header-cell.active-sort {
  color: #6200ea;
  font-weight: 500;
}

.header-cell.active-sort::after {
  content: none;
}
</style>

