<template>
  <v-container class="pa-6">
    <v-card class="pa-6 rounded-lg">
      <v-card-title class="text-h5 font-weight-bold mb-6">
        프로젝트 수정
      </v-card-title>
      
      <v-card-text>
        <!-- 기본 정보 섹션 -->
        <div class="mb-6">
          <div class="text-subtitle-1 font-weight-medium mb-4">기본 정보</div>
          
          <div class="mb-4">
            <div class="text-body-2 font-weight-medium mb-2">기수</div>
            <v-text-field
              v-model="project.batch"
              type="number"
              outlined
              dense
              hide-details="auto"
              background-color="white"
            ></v-text-field>
          </div>

          <div class="mb-4">
            <div class="text-body-2 font-weight-medium mb-2">팀명</div>
            <v-text-field
              v-model="project.teamName"
              outlined
              dense
              hide-details="auto"
              background-color="white"
            ></v-text-field>
          </div>

          <div class="mb-4">
            <div class="text-body-2 font-weight-medium mb-2">서비스명</div>
            <v-text-field
              v-model="project.serviceName"
              outlined
              dense
              hide-details="auto"
              background-color="white"
            ></v-text-field>
          </div>

          <div class="mb-4">
            <div class="text-body-2 font-weight-medium mb-2">프로젝트 유형</div>
            <v-select
              v-model="project.projectType"
              :items="projectTypeOptions"
              outlined
              dense
              hide-details="auto"
              background-color="white"
            ></v-select>
          </div>
        </div>

        <v-card-text style="min-height: 500px">
          <quill-editor
            ref="quillEditor"
            v-model="project.explanation"
            :disabled="false"
            :value="contents"
            :options="editorOptions"
            @text-change="onEditorChange"
            @ready="onEditorReady"
            @drop="handleImageDrop"
          />
        </v-card-text>

        <!-- 상세 정보 섹션 -->
        <div class="mb-6">
          <div class="text-subtitle-1 font-weight-medium mb-4">상세 정보</div>
          
          <div class="mb-4">
            <div class="text-body-2 font-weight-medium mb-2">링크</div>
            <v-text-field
              v-model="project.link"
              outlined
              dense
              hide-details="auto"
              background-color="white"
            ></v-text-field>
          </div>

          <div class="mb-4">
            <div class="text-body-2 font-weight-medium mb-2">프로젝트 주제</div>
            <v-text-field
              v-model="project.domain"
              outlined
              dense
              hide-details="auto"
              background-color="white"
            ></v-text-field>
          </div>
        </div>

        <!-- 주요 기능 섹션 -->
        <div>
          <div class="text-subtitle-1 font-weight-medium mb-4">주요 기능</div>
          <div class="mb-4">
            <div class="text-body-2 font-weight-medium mb-2">주요 기능 입력</div>
            <v-text-field
              v-model="featureInput"
              hint="콤마(,)로 구분하여 여러 기능을 한 번에 입력할 수 있습니다"
              persistent-hint
              outlined
              dense
              hide-details="auto"
              background-color="white"
            ></v-text-field>
          </div>

          <v-chip-group class="mt-3">
            <v-chip
              v-for="(feature, index) in project.primaryFeatureList"
              :key="index"
              closable
              @click:close="removeFeature(index)"
              color="primary"
              text-color="white"
              class="mr-2 mb-2"
              small
            >
              {{ feature.utilityName }}
            </v-chip>
          </v-chip-group>
        </div>
      </v-card-text>

      <v-card-actions class="pt-6">
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          x-large
          min-width="150"
          @click="updateProject"
          elevation="2"
        >
          프로젝트 수정
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { reactive, ref, watch } from "vue";
import axios from "axios";
import router from "@/router";
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import hljs from "highlight.js";
import "highlight.js/styles/tomorrow.css";

export default {
  components: {
    QuillEditor,
  },
  
  data() {
    return {
      editorOptions: {
        placeholder: "리드미의 팀원,프로젝트 소개 및 개요 부분을 복사해주세요",
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ size: ["small", false, "large", "huge"] }],
            [{color:[]},{background:[]}],
            [{ 'align': [] }],
            ['clean']
          ],
          syntax:{
            highlight : (text) => hljs.highlightAuto(text).value
          },
        },
        formats: [
          'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
          'header', 'list', 'bullet', 'script', 'indent', 'direction',
          'size', 'color', 'background', 'link', 'image', 'align', 'ordered', 'clean'
        ]
      },
      content:"",
      attachments:[],
    }
  },

  computed:{
    editor(){
      return this.$refs.quillEditor.quill;
    },
    contentCode(){
      return hljs.highlightAuto(this.content).value;
    },
  },

  methods:{
    async handleImageDrop(event) {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("attachments", file);

      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/post/drag-image`, formData,
          {headers: {"Content-Type": "multipart/form-data"}}
        );
        const imageUrl = response.data.result;
        const editor = this.$refs.quillEditor.getQuill();
        const range = editor.getSelection();
        editor.insertEmbed(range.index, "image", imageUrl);
      } catch(error) {
        console.log("드래그 이미지업로드 실패", error);
      }
    },
  },

  setup() {
    const project = reactive({
      batch: "",
      teamName: "",
      serviceName: "",
      projectType: "",
      link: "",
      domain: "",
      explanation: "",
      primaryFeatureList: []
    });
    const projectTypeOptions = ref([]);
    const featureInput = ref("");
    const editorInstance = ref(null);

    const onEditorReady = (editor) => {
      editorInstance.value = editor;
      console.log("Quill Editor is ready!", editorInstance.value);
    };

    const onEditorChange = () => {
      if (editorInstance.value) {
        project.explanation = editorInstance.value.root.innerHTML;
      } else {
        console.warn("Editor instance is not ready yet");
      }
    };

    const addFeature = () => {
      if (featureInput.value.trim() === "") return;
      let features = featureInput.value.split(",").map(f => ({ utilityName: f.trim() }));
      project.primaryFeatureList.push(...features);
      featureInput.value = "";
    };

    const removeFeature = (index) => {
      project.primaryFeatureList.splice(index, 1);
    };

    const fetchProjectTypes = async () => {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/project/types`);
        projectTypeOptions.value = response.data.result || response.data;
      } catch (error) {
        console.error("❌ 프로젝트 유형 불러오기 실패:", error);
      }
    };

    // 프로젝트 데이터 불러오기
    const fetchProjectData = async () => {
      try {
        const projectId = router.currentRoute.value.params.id;
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/project/detailsee/${projectId}`);
        const projectData = response.data.result;
        
        // 데이터 매핑
        project.batch = projectData.batch;
        project.teamName = projectData.teamName;
        project.serviceName = projectData.serviceName;
        project.projectType = projectData.projectType;
        project.link = projectData.link;
        project.domain = projectData.domain;
        project.explanation = projectData.explanation;
        project.primaryFeatureList = projectData.primaryFeatureList || [];

        // Quill 에디터에 내용 설정
        if (editorInstance.value) {
          editorInstance.value.root.innerHTML = projectData.explanation;
        }
      } catch (error) {
        console.error("❌ 프로젝트 데이터 불러오기 실패:", error);
      }
    };

    const updateProject = async () => {
      if (!project.projectType) {
        alert("프로젝트 유형을 선택해주세요");
        return;
      }

      if (featureInput.value.trim() !== "") {
        const features = featureInput.value.split(",").map(f => ({ utilityName: f.trim() }));
        project.primaryFeatureList.push(...features);
        featureInput.value = "";
      }

      const projectData = {
        batch: project.batch,
        projectType: project.projectType,
        teamName: project.teamName,
        serviceName: project.serviceName,
        contents: project.explanation,
        link: project.link,
        domain: project.domain,
        primaryFeatureSaveReqList: project.primaryFeatureList
      };
      console.log("체크")
      console.log(projectData)

      try {
        const projectId = router.currentRoute.value.params.id;
        const response = await axios.put(`${process.env.VUE_APP_API_BASE_URL}/project/update/${projectId}`, projectData);
        console.log("✅ 프로젝트 수정 성공:", response.data);
        router.push({ path: "/ttt/project/find" });
      } catch (error) {
        console.error("❌ 프로젝트 수정 실패:", error);
        if (error.response?.data?.message) {
          alert(error.response.data.message);
        }
      }
    };

    watch(() => project.primaryFeatureList, (newVal) => {
      console.log("🔄 [watch] primaryFeatureList 변경됨:", JSON.parse(JSON.stringify(newVal)));
    });

    return {
      project,
      projectTypeOptions,
      featureInput,
      addFeature,
      removeFeature,
      updateProject,
      fetchProjectTypes,
      fetchProjectData,
      editorInstance,
      onEditorReady,
      onEditorChange
    };
  },
  
  async created() {
    await this.fetchProjectTypes();
    await this.fetchProjectData();
  }
};
</script>

<style scoped>
::v-deep .ql-editor {
  min-height: 800px;
  font-size: 25px;
}

::v-deep .ql-editor img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}
</style>
