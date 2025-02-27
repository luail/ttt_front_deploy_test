<template>
  <v-container class="pa-6">
    <v-card>
      <v-card-title class="text-center text-h5">
        Beyond SW Camp 프로젝트
      </v-card-title>
      
      <!-- 검색 영역 -->
      <v-row align="center" justify="center">
        <v-col cols="8">
          <div class="search-area">
            <v-select
              v-model="searchType"
              :items="searchOptions"
              item-title="text"
              item-value="value"
              hide-details
              class="search-select"
              style="max-width: 180px"
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
          <v-btn @click="goToProjectCreate" color="purple" class="neon-btn">프로젝트 등록</v-btn>
        </v-col>
      </v-row>

          <!-- 테이블 영역 -->
          <div class="table-container">
            <div class="custom-table">
              <!-- 테이블 헤더 -->
              <div class="table-row header">
                <div class="header-cell sortable" @click="sort('batch')" :data-sorted="sortBy === 'batch'">
                  기수
                  <v-icon small class="sort-icon">{{ getSortIcon('batch') }}</v-icon>
                </div>
                <div class="header-cell sortable" @click="sort('teamName')">
                  팀명
                  <v-icon small class="sort-icon">{{ getSortIcon('teamName') }}</v-icon>
                </div>
                <div class="header-cell sortable" @click="sort('projectType')">
                  프로젝트 유형
                  <v-icon small class="sort-icon">{{ getSortIcon('projectType') }}</v-icon>
                </div>
                <div class="header-cell sortable" @click="sort('serviceName')">
                  서비스명
                  <v-icon small class="sort-icon">{{ getSortIcon('serviceName') }}</v-icon>
                </div>
                <div class="header-cell" style="width: 220px">기능 키워드</div>
                <div class="header-cell sortable" @click="sort('viewCount')">
                  조회수
                  <v-icon small class="sort-icon">{{ getSortIcon('viewCount') }}</v-icon>
                </div>
                <div class="header-cell sortable" @click="sort('likesCounts')">
                  좋아요
                  <v-icon small class="sort-icon">{{ getSortIcon('likesCounts') }}</v-icon>
                </div>
                <div class="header-cell sortable" @click="sort('commentCounts')">
                  댓글
                  <v-icon small class="sort-icon">{{ getSortIcon('commentCounts') }}</v-icon>
                </div>
                <div class="header-cell" style="width: 60px">링크</div>
              </div>

              <!-- 테이블 본문 -->
              <div class="table-body">
                <div v-for="item in sortedAndFilteredProjects" 
                     :key="item.id" 
                     class="table-row" 
                     @click="goToProjectDetail(item.id)">
                  <div class="cell text-center" style="width: 70px">{{ item.batch }}</div>
                  <div class="cell" style="width: 120px">{{ item.teamName }}</div>
                  <div class="cell" style="width: 140px">
                    <v-chip small :color="getProjectTypeColor(item.projectType)" text-color="white">
                      {{ item.projectType }}
                    </v-chip>
                  </div>
                  <div class="cell" style="width: 140px">{{ item.serviceName }}</div>
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
              </div>
            </div>
          </div>

          <!-- 페이지네이션 -->
          <div class="pagination-container">
            <v-pagination
              v-model="currentPage"
              :length="Math.ceil(filteredProjects.length / 8)"
              :total-visible="8"
            ></v-pagination>
          </div>
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
      itemsPerPage: 8, //한 페이지당 표시될 프로젝트 개수
      currentPage: 1, //현재 보고 있는 페이지 번호
      isLoading: false,
      isLastPage: false,
      searchOptions: [
        { text: '전체', value: 'optional' },
        { text: '기수', value: 'batch' },
        { text: '프로젝트 유형', value: 'projectType' },
        { text: '서비스명', value: 'serviceName' },
        { text: '기능명', value: 'featureName' }
      ],
      searchType: 'optional',
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
        itemsPerPage: 8,
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
    },
    currentPage: {
      handler(newPage) {
        this.fetchPageData(newPage);
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
          } else if (this.searchType === 'featureName') {
            // 기능명으로 검색
            return project.primaryFeatureList && 
                   project.primaryFeatureList.some(feature => 
                     feature.featureName.toLowerCase().includes(this.searchKeyword.toLowerCase())
                   );
          }
          return true;
        });
      }

      // 기능 키워드 필터링
      result = this.filterByFeature(result);
      
      return result;
    },
    sortedAndFilteredProjects() {
      const start = (this.currentPage - 1) * 8;
      const end = start + 8;
      
      let result = [...this.filteredProjects];
      
      // 정렬 로직
      if (this.sortBy) {
        result.sort((a, b) => {
          let compareA = a[this.sortBy];
          let compareB = b[this.sortBy];
          
          if (['batch', 'viewCount', 'likesCounts', 'commentCounts'].includes(this.sortBy)) {
            compareA = Number(compareA) || 0;
            compareB = Number(compareB) || 0;
          } else {
            compareA = String(compareA || '').toLowerCase();
            compareB = String(compareB || '').toLowerCase();
          }
          
          return this.sortDesc 
            ? (compareB > compareA ? 1 : -1)
            : (compareA > compareB ? 1 : -1);
        });
      }
      
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
        itemsPerPage: 8,
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
      this.currentPage = 1;
      this.fetchPageData(1);
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
      this.currentPage = 1;
      this.fetchPageData(1);
    },
    resetScroll() {
      setTimeout(() => {
        const container = document.querySelector('.virtual-scroll-container');
        if (container) {
          container.scrollTop = 0;
        }
      }, 0);
    },
    getSortIcon(column) {
      if (this.sortBy !== column) return 'mdi-sort';
      return this.sortDesc ? 'mdi-sort-descending' : 'mdi-sort-ascending';
    },
    async fetchPageData(page) {
      try {
        const params = new URLSearchParams({
          page: page,
          size: 8
        });

        // 정렬 정보 추가
        if (this.sortBy) {
          params.append('sort', this.sortBy);
          params.append('direction', this.sortDesc ? 'desc' : 'asc');
        }

        // 검색 조건 추가
        if (this.searchType !== 'optional' && this.searchKeyword) {
          params.append('searchType', this.searchType);
          params.append('keyword', this.searchKeyword);
        }

        // 기능 키워드 필터 추가
        if (this.selectedFeature) {
          params.append('feature', this.selectedFeature);
        }

        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/project/listAll?${params.toString()}`
        );
        
        this.projectList = response.data.result;
        this.totalItems = response.data.totalCount || this.projectList.length;
      } catch (error) {
        console.error("페이지 데이터 조회 실패:", error);
      }
    },
  }
};
</script>

<style scoped>
/* 전체 컨텐츠 래퍼 */
.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
}

/* 카드 타이틀 */
.v-card-title {
  font-size: 1.5rem !important;
  font-weight: 600 !important;
  color: #2c3e50;
  padding: 24px 0 !important;
  letter-spacing: 0.5px;
}

/* 검색 영역 컨테이너 */
.search-area {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  margin: 0 24px 20px 24px;
  width: 100%;
}

/* 검색 select 박스 현대적 스타일링 */
.search-select {
  min-width: 180px;
  margin-right: 16px;
}

.search-select :deep(.v-field) {
  border-radius: 8px;
  background-color: #f5f5f5 !important;
  border: 1px solid transparent;
}

.search-select :deep(.v-field.v-field--focused) {
  border: 1px solid #9c27b0;
  background-color: white !important;
}

.search-select :deep(.v-field__outline) {
  display: none;
}

/* 검색 입력창 현대적 스타일링 */
.search-input {
  flex: 1;
  min-width: 300px;
}

.search-input :deep(.v-field) {
  border-radius: 8px;
  background-color: #f5f5f5 !important;
  border: 1px solid transparent;
}

.search-input :deep(.v-field.v-field--focused) {
  border: 1px solid #9c27b0;
  background-color: white !important;
}

.search-input :deep(.v-field__outline) {
  display: none;
}

/* 생성 버튼 */
.neon-btn {
  height: 40px;
  min-width: 80px;
  margin-left: 130px;  /* 버튼을 검색창 쪽으로 더 가깝게 이동 */
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.5px;
  background-color: #3a3af4 !important;
  color: white !important;
  border: none;
  transition: all 0.2s ease;
}

.neon-btn:hover {
  background-color: #2828d4 !important;  /* 호버 시 살짝 어두워짐 */
  transform: translateY(-1px);
}

.neon-btn:active {
  transform: translateY(1px);
}

/* 검색 영역 반응형 */
@media (max-width: 768px) {
  .search-area {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }
  
  .search-select,
  .search-input {
    width: 100% !important;
    margin-left: 0;
  }
}

/* 테이블 컨테이너 */
.table-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* 테이블 기본 */
.custom-table {
  width: 98%;
  max-width: 1300px;
  margin: 0 auto;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

/* 테이블 행 */
.table-row {
  display: flex;
  width: 100%;
  min-height: 48px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  align-items: center;
}

/* 모든 셀 공통 */
.header-cell,
.cell {
  display: flex;
  align-items: center;
  padding: 12px 8px;
  min-height: 48px;
}

/* 각 컬럼별 너비와 정렬 */
/* 기수 */
.header-cell:first-child {
  flex: 0 0 80px;
  padding-left: 32px;
  text-align: right;
  justify-content: flex-end;
}

.cell:first-child {
  flex: 0 0 80px;
  padding-left: 16px;
  text-align: center;
  justify-content: center;
}

/* 팀명 */
.header-cell:nth-child(2),
.cell:nth-child(2) {
  flex: 0 0 160px;
  justify-content: center;
}

/* 프로젝트 유형 */
.header-cell:nth-child(3),
.cell:nth-child(3) {
  flex: 0 0 140px;
  justify-content: center;
}

/* 서비스명 */
.header-cell:nth-child(4),
.cell:nth-child(4) {
  flex: 0 0 180px;
  justify-content: center;
}

/* 기능 키워드 */
.header-cell:nth-child(5),
.cell:nth-child(5) {
  flex: 1;
  min-width: 200px;
  justify-content: center;
}

/* 조회수, 좋아요, 댓글 */
.header-cell:nth-child(6),
.cell:nth-child(6),
.header-cell:nth-child(7),
.cell:nth-child(7),
.header-cell:nth-child(8),
.cell:nth-child(8) {
  flex: 0 0 80px;
  justify-content: center;
}

/* 링크 */
.header-cell:last-child,
.cell:last-child {
  flex: 0 0 60px;
  justify-content: center;
}

/* 기능 태그 컨테이너 */
.feature-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  align-items: center;
}

/* 태그 스타일 */
.v-chip {
  margin: 2px 4px;
}

/* 정렬 가능한 헤더 스타일 */
.header-cell.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
  position: relative;
}

.header-cell.sortable:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* 정렬 아이콘 */
.sort-icon {
  margin-left: 4px;
  font-size: 16px;
  opacity: 0;
  transition: opacity 0.2s;
}

.header-cell.sortable:hover .sort-icon,
.header-cell.sortable.sorted .sort-icon {
  opacity: 1;
}

/* 페이지네이션 컨테이너 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin: 16px 0;  /* 상하 여백 줄임 */
}

/* 페이지네이션 크기 조정 */
.v-pagination :deep(.v-btn) {
  min-width: 32px !important;  /* 버튼 너비 축소 */
  width: 32px;
  height: 32px !important;    /* 버튼 높이 축소 */
  margin: 0 4px;              /* 버튼 간격 조정 */
  padding: 0 !important;
}

/* 페이지 숫자 크기 조정 */
.v-pagination :deep(.v-btn__content) {
  font-size: 0.875rem;  /* 글자 크기 축소 */
}

/* 호버 효과 */
.table-row:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

/* 정렬 아이콘이 있는 헤더 */
.header-cell {
  white-space: nowrap;
}

/* 선택된 기능 키워드 칩 스타일 수정 */
.selected-chip {
  background-color: #7C4DFF !important; /* 보라색 배경 */
  color: white !important; /* 흰색 텍스트 */
  border: none !important; /* 테두리 제거 */
  font-weight: 500 !important; /* 글자 두께 증가 */
  box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important; /* 그림자 효과 */
}

/* 일반 기능 키워드 칩 스타일 */
.v-chip.v-chip--outlined {
  border-color: #e0e0e0;
  transition: all 0.2s ease;
}

/* 호버 효과 */
.v-chip.v-chip--outlined:hover {
  background-color: #f5f5f5;
  border-color: #9575CD;
}
</style>

