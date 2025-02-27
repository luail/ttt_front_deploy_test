<template>
  <v-container>
    <v-row>
      <!-- 왼쪽 프로필 카드 -->
      <YourProfileCard
        :avatar="userDetail.profileImageOfAuthor"
        :userName="userDetail.authorNickName"
        selectedMenu="project"
      />

      <!-- 오른쪽 프로젝트 목록 -->
      <v-col cols="8">
        <v-card class="pa-4">
          <v-card-title class="title-text">📌 {{ nickName }} 님의 프로젝트</v-card-title>
          <v-divider></v-divider>
          <v-card-text v-if="projects.length">
            <v-row>
              <v-col v-for="project in projects" :key="project.id" cols="12">
                <v-card class="post-card" @click="goToProjectDetail(project.id)">
                  <v-card-text>
                    <!-- 프로젝트 정보 -->
                    <v-row no-gutters class="align-center">
                      <v-col>
                        <h3 class="post-title">
                          {{ project.serviceName }}
                        </h3>
                        <p class="text-preview">
                          팀명: {{ project.teamName }} | 유형: {{ project.projectType }}
                        </p>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text v-else>
            등록된 프로젝트가 없습니다.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";
import YourProfileCard from "@/components/YourProfileCard.vue"; // 프로필 카드 컴포넌트 import

export default {
  components: {
    YourProfileCard,
  },
  props: {
    nickName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      userDetail: {}, // 유저 정보 저장
      projects: [],
    };
  },
  async created() {
    await this.fetchUserProjects();
  },
  methods: {
    async fetchUserProjects() {
      try {
        console.log(`🔍 닉네임 "${this.nickName}"의 프로젝트를 불러오는 중...`);
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/project/user/${encodeURIComponent(this.nickName)}`
        );

        this.projects = response.data.result || [];
        console.log("📌 가져온 프로젝트:", this.projects);

        // 첫 번째 프로젝트에서 유저 정보 가져오기
        if (this.projects.length > 0) {
          this.userDetail = {
            profileImageOfAuthor: this.projects[0].authorImage || "",
            authorNickName: this.projects[0].authorNickName || "익명",
          };
        }
      } catch (error) {
        console.error("❌ 프로젝트 불러오기 실패:", error);
        this.projects = [];
      }
    },
    goToProjectDetail(projectId) {
      console.log("선택된 프로젝트 ID:", projectId);
      if (!projectId) {
        console.error("프로젝트 ID가 정의되지 않았습니다.");
        return;
      }
      this.$router.push(`/ttt/project/detail/${projectId}`);
    },
  },
};
</script>

<style scoped>
/* 제목 스타일 */
.title-text {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

/* 프로젝트 카드 스타일 */
.post-card {
  cursor: pointer;
  transition: 0.3s ease-in-out;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
  padding: 16px;
}

/* 마우스 호버 시 카드 효과 */
.post-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(98, 0, 234, 0.3);
}

/* 내용 스타일 */
.text-preview {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

/* 반응형 설정 */
@media (max-width: 768px) {
  .post-card {
    padding: 10px;
  }
  .title-text {
    font-size: 18px;
  }
}
</style>
