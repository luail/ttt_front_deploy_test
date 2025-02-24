<!--사용안하는 페이지 : 맨처음에 페이지로 만들었다가 팝업으로 수정할수있게 수정-->
<template>
  <v-container>
    <v-card>
      <v-card-title class="text-center text-h5">프로젝트 수정</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field
              label="기수"
              v-model="project.batch"
              type="number"
              required
          ></v-text-field>
          <v-select
              label="프로젝트 유형"
              :items="projectTypes"
              v-model="project.projectType"
              required
          ></v-select>
          <v-text-field
              label="팀명"
              v-model="project.teamName"
              required
          ></v-text-field>
          <v-text-field
              label="서비스명"
              v-model="project.serviceName"
              required
          ></v-text-field>
          <v-text-field
              label="링크"
              v-model="project.link"
              required
          ></v-text-field>
          <v-text-field
              label="프로젝트 주제(도메인)"
              v-model="project.domain"
              required
          ></v-text-field>
          <v-text-field
              label="주요 기능 (콤마로 구분)"
              v-model="featuresInput"
              hint="예: 기능1, 기능2, 기능3"
              persistent-hint
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="submitEdit" :disabled="!valid">
          수정 완료
        </v-btn>
        <v-btn text @click="goBack">취소</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      valid: false,
      project: {
        id: null,
        batch: "",
        projectType: "",
        teamName: "",
        serviceName: "",
        link: "",
        domain: "",
        primaryFeatureList: [],
      },
      featuresInput: "",
      projectTypes: ["FRONTEND", "BACKEND", "DEVOPS", "DB", "FINAL"],
    };
  },
  created() {
    this.fetchProjectDetail();
  },
  methods: {
    async fetchProjectDetail() {
      const id = this.$route.params.id;
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/project/detail/${id}`);
        this.project = response.data.result;
        if (this.project.primaryFeatureList && Array.isArray(this.project.primaryFeatureList)) {
          this.featuresInput = this.project.primaryFeatureList.map(f => f.featureName).join(", ");
        }
      } catch (error) {
        console.error("프로젝트 상세 정보 불러오기 실패", error);
        alert("프로젝트 정보를 불러오는데 실패했습니다.");
      }
    },
    async submitEdit() {
      if (!this.$refs.form.validate()) return;
      const featuresArray = this.featuresInput.split(",")
          .map(item => ({utilityName: item.trim()}))
          .filter(item => item.utilityName !== "");
      const updateData = {
        batch: Number(this.project.batch),
        projectType: this.project.projectType,
        teamName: this.project.teamName,
        serviceName: this.project.serviceName,
        link: this.project.link,
        domain: this.project.domain,
        primaryFeatureSaveReqList: featuresArray,
      };
      try {
        const id = this.project.id;
        await axios.put(`${process.env.VUE_APP_API_BASE_URL}/project/update/${id}`, updateData);
        alert("프로젝트 수정이 완료되었습니다.");
        this.$emit("updated");
        this.$router.push("/ttt/project/find");
        this.editDialog = false;
      } catch (error) {
        console.error("프로젝트 수정 실패", error);
        alert("프로젝트 수정에 실패했습니다.");
      }
    },
    goBack() {
      this.$router.push("/ttt/project/find");
    },

    handleProjectUpdated(updatedProject) {
      this.editDialogVisible = false;
      this.selectedProjects = [];
      this.selectAll = false;
      // 업데이트된 프로젝트로 projectList 갱신
      this.projectList = this.projectList.map(project =>
          project.id === updatedProject.id ? updatedProject : project
      );
      this.$forceUpdate(); // Vue 강제 갱신
    },
  }
};
</script>

<style scoped>
/* 필요한 스타일 추가 */
</style>
