<template>
  <v-container class="pa-6">
    <v-card class="pa-6 rounded-lg">
      <v-card-title class="text-h5 font-weight-bold mb-6">
        새 프로젝트 생성
      </v-card-title>
      
      <v-card-text>
        <!-- 기본 정보 섹션 -->
        <div class="mb-6">
          <div class="text-subtitle-1 font-weight-medium mb-4">기본 정보</div>
          
          <div class="mb-4">
            <div class="text-body-2 font-weight-medium mb-2">기수</div>
            <v-text-field
              v-model="project.batch"
              label="숫자만 입력하세요(ex.11)"
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
              label="팀명을 입력해주세요"
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
              label="서비스명(or 프로젝트명)을 입력해주세요"
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
              label="프로젝트 유형을 선택해주세요"
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
                :value="explanation"
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
              label="깃허브 레포지토리 링크를 입력해주세요"
              outlined
              dense
              persistent-hint
              background-color="white"
            ></v-text-field>
          </div>

          <div class="mb-4">
            <div class="text-body-2 font-weight-medium mb-2">프로젝트 주제</div>
            <v-text-field
              v-model="project.domain"
              label="프로젝트 주제를 입력해주세요(ex.숙박플랫폼, 커뮤니티사이트, 호텔예약시스템 등)"
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
              label="주요 기능을 입력해주세요(ex.채팅, Oath로그인, 실시간영상전송)"
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
          color="purple"
          class="neon-btn"
          x-large
          min-width="150"
          @click="saveProject"
          elevation="2"
        >
          프로젝트 생성
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
  // 최상단에 추가
  import hljs from "highlight.js";
  import "highlight.js/styles/tomorrow.css";

export default {
  components: {
      QuillEditor,
    },
  
  data() {
    return{
        editorOptions: {
          placeholder: "리드미의 팀원,프로젝트 소개 및 개요 부분을 복사해주세요",
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline', 'strike'], // 텍스트 스타일
              [{ 'list': 'ordered'}, { 'list': 'bullet' }], // 리스트
              [{ size: ["small", false, "large", "huge"] }],
              [{color:[]},{background:[]}],
              [{ 'align': [] }], // 정렬 옵션
              ['clean'] // 포맷 초기화
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
    //   onEditorReady(editor){
    //     this.editorInstance = editor;
    //     console.log("Quill Editor is ready!", this.editorInstance);
    //   },
    //  //에디터 변경시 content에 값 저장
    //   onEditorChange(){
    //     if(this.editorInstance){
    //       this.project.explanation = this.editorInstance.root.innerHTML;
    //     } else{
    //       console.warn("Editor instance is not ready yet")
    //     }
    //   },
  
      async handleImageDrop(event) {
        // 퀼에디터의 드롭 동작을 인식하기 위해 기본 드롭동작을 막음
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (!file) return;
  
        const formData = new FormData();
        formData.append("attachments",file);
  
        try{
         const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/post/drag-image`,formData,
          {headers:{"Content-Type":"multipart/form-data"}}
        );
          console.log(response);
          const imageUrl = response.data.result;
          const editor = this.$refs.quillEditor.getQuill();
          const range = editor.getSelection();
          editor.insertEmbed(range.index,"image",imageUrl);
  
        }catch(error){
          console.log("드래그 이미지업로드 실패",error);
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
      console.log("✅ [addFeature] primaryFeatureList:", JSON.parse(JSON.stringify(project.primaryFeatureList)));
    };

    const removeFeature = (index) => {
      project.primaryFeatureList.splice(index, 1);
    };

    const fetchProjectTypes = async () => {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/project/types`);
        // 응답이 CommonDto 형태면 response.data.result, 아니면 response.data 사용
        projectTypeOptions.value = response.data.result || response.data;
      } catch (error) {
        console.error("❌ 프로젝트 유형 불러오기 실패:", error);
      }
    };

    const saveProject = async () => {
      if (!project.projectType) {
        alert("프로젝트 유형을 선택해주세요");
        return;
      }

      // featureInput에 값이 있다면, 저장 전에 primaryFeatureList에 추가
      if (featureInput.value.trim() !== "") {
        const features = featureInput.value.split(",").map(f => ({ utilityName: f.trim() }));
        project.primaryFeatureList.push(...features);
        featureInput.value = ""; // 입력 필드 초기화
      }

      const projectData = {
        batch: project.batch,
        projectType: project.projectType,
        teamName: project.teamName,
        serviceName: project.serviceName,
        contents : project.explanation,
        link: project.link,
        domain: project.domain,
        primaryFeatureSaveReqList: project.primaryFeatureList
      };

      console.log("🚀 백엔드로 보낼 데이터:", projectData);

      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/project/create`, projectData);
        console.log("✅ 프로젝트 생성 성공:", response.data);
        router.push({ path: "/ttt/project/find" }).then(() => {
          window.location.reload();
        });
      } catch (error) {
        console.error("❌ 프로젝트 생성 실패:", error);
        if (error.response && error.response.data && error.response.data.message) {
          console.log(error.response.data.message);
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
      saveProject,
      fetchProjectTypes,
      editorInstance,
      onEditorReady,
      onEditorChange
    };
  },
  async created() {
    await this.fetchProjectTypes();
  }
};
</script>

<style scoped> 
/* Quill Editor 스타일 외부 라이브러리이므로 스타일이 적용이안되 브이 딥명령어 이용*/
::v-deep .ql-editor {
    min-height: 800px;
    font-size: 25px;
  
  }
  
  ::v-deep .ql-editor img {
    max-width: 100%;  /* 화면을 벗어나지 않도록 설정 */
    height: auto;  /* 비율 유지하면서 자동 조정 */
    display: block;  /* 블록 요소로 변경 (여백 조정) */
    margin: 0 auto;  /* 중앙 정렬 */
  }
.neon-btn {
  font-size: 1rem !important;
  font-weight: 500;
  transition: all 0.3s ease;
}

.neon-btn:hover {
  background-color: #7c3aed !important;
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(150, 64, 255, 0.7);
  color: #ffffff !important;
}
</style> 

