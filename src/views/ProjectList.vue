<template>
  <v-container class="pa-6">
    <v-row>
      <v-col>
        <v-card>
          <v-card-title class="text-center text-h5">
            Beyond SW Camp 프로젝트
          </v-card-title>
          <v-row align="center">
            <v-col cols="2">
              <!-- 검색창 -->
              <v-select
                  v-model="searchType"
                  :items="searchOptions"
                  item-title="text"
                  item-value="value"
                  outlined
                  dense
                  background-color="white"
              ></v-select>
            </v-col>
            <v-col cols="8">
              <v-text-field
                  v-model="searchKeyword"
                  label="검색어 입력"
                  outlined
                  dense
                  clearable
                  background-color="white"
                  @keyup.enter="searchProjects"
              ></v-text-field>
            </v-col>
            <v-col cols="2" class="d-flex">
              <v-btn color="primary" class="mr-2" @click="searchProjects">검색</v-btn>
              <v-btn @click="goToProjectCreate">생성</v-btn>
            </v-col>
          </v-row>

          
          <v-card-text>
            <v-data-table
                :headers="headers"
                :items="filteredProjects"
                :items-per-page="pageSize"
                hide-default-footer
                class="elevation-1 custom-table"
            >
              <template v-slot:item="{ item }">
                <tr class="project-row">
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
                          @click="toggleFeature(feature.featureName)"
                          small
                          outlined
                      >
                        {{ feature.featureName || '기능 없음' }}
                      </v-chip>
                    </v-chip-group>
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
                      @click="openLink(item.link)"
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

    <!-- 페이지네이션 -->
    <div class="text-center pt-4">
      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="7"
        @click="handlePageChange"
      ></v-pagination>
    </div>
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
      page:1,
      pageSize: 10,
      currentPage: 1,
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
        { title: '기수', key: 'batch', align: 'center', width: '80px' },
        { title: '팀명', key: 'teamName', width: '200px' },
        { title: '프로젝트 유형', key: 'projectType', width: '120px' },
        { title: '서비스명', key: 'serviceName', width: '150px' },
        { title: '기능 키워드', key: 'primaryFeatureList', width: '300px' },
        { title: '좋아요', key: 'likeCount', align: 'center', width: '100px' },
        { title: '댓글', key: 'commentCount', align: 'center', width: '100px' },
        { title: '링크', key: 'link', align: 'center', width: '80px' },
      ],
      totalItems: 0,
      totalPages: 0
    };
  },
  async created() {
    await this.fetchProjects();
  },
  computed: {
    filteredProjects() {
      return this.selectedFeature
        ? this.projectList.filter(project =>
            project.primaryFeatureList.some(feature => 
              feature.featureName === this.selectedFeature
            )
          )
        : this.projectList; //?
    }
  },
  methods: {
    async fetchProjects() {
      try {
        let params = {
          size: this.pageSize,
          page: this.currentPage - 1,
          ...this.getSearchParams()
        };
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/project/find`, { params });
        console.log(response);
        
        this.projectList = response.data.result.content;
        this.totalPages = response.data.result.totalPages;
        this.totalItems = response.data.result.totalElements;
      } catch (e) {
        console.log("데이터 불러오기 실패", e);
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
      this.currentPage = 1;
      await this.fetchProjects();
    },
    formatUrl(url) {
      if (!url || url.trim() === "") return null;
      return url.startsWith('http://') || url.startsWith('https://') ? url : "https://" + url;
    },
    async toggleFeature(featureName) {
      this.selectedFeature = this.selectedFeature === featureName ? null : featureName;
      const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/project/listAll`);
      console.log("프로젝트")
      console.log(response);
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
    handlePageChange() {
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
    }
  }
};
</script>

<style>
.custom-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.project-row {
  height: 60px;
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
</style>
